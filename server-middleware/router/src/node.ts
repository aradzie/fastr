import {
  isLiteral,
  MatchedPathParams,
  matchFragment,
  PatternSegment,
} from "./path";
import { Route } from "./route";

export const kNotFound = Symbol("kNotFound");
export const kMethodNotAllowed = Symbol("kMethodNotAllowed");

/**
 * The node class from which the prefix tree is built.
 */
export class Node {
  private readonly literalChildren = new Map<string, Node>();
  private readonly patternChildren = new Map<
    string,
    {
      readonly segment: PatternSegment;
      readonly node: Node;
    }
  >();
  private readonly routesByMethod = new Map<string, Route>();

  private match(fragment: string, params: MatchedPathParams): Node | null {
    // Match against literal segments.
    const node = this.literalChildren.get(fragment);
    if (node != null) {
      return node;
    }
    // Match against pattern segments.
    for (const { segment, node } of this.patternChildren.values()) {
      if (matchFragment(segment, fragment, params)) {
        return node;
      }
    }
    return null;
  }

  /**
   * Inserts the given route into the root of the given tree creating new nodes as needed.
   */
  static insert(root: Node, route: Route): void {
    // Build prefix tree.
    const { segments } = route;
    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const { literalChildren, patternChildren } = node;
      const { literal } = segment;
      switch (segment.type) {
        case "literal": {
          let child = literalChildren.get(literal);
          if (child == null) {
            literalChildren.set(literal, (child = new Node()));
          }
          node = child;
          break;
        }
        case "pattern": {
          let child = patternChildren.get(literal);
          if (child == null) {
            patternChildren.set(
              literal,
              (child = {
                segment,
                node: new Node(),
              }),
            );
          }
          node = child.node;
          break;
        }
      }
    }
    node.routesByMethod.set(route.method, route);

    Node.insertShortcuts(root, route);
  }

  private static insertShortcuts(root: Node, route: Route): void {
    // Insert shortcuts for faster lookup by the whole suffix of a path.
    // The prefix tree must already be built in order for this function to work.
    const { segments } = route;
    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const suffix = segments.slice(i);
      if (suffix.length > 1 && suffix.every(isLiteral)) {
        // Find leaf node.
        let leaf = node;
        for (let j = i; j < segments.length; j++) {
          leaf = leaf.literalChildren.get(segments[j].literal)!;
        }
        // Insert shortcuts to the leaf node.
        for (let j = i; j < segments.length - 1; j++) {
          const literal = segments
            .slice(j)
            .map(({ literal }) => literal)
            .join("");
          node.literalChildren.set(literal, leaf);
          node = node.literalChildren.get(segments[j].literal)!;
        }
        break;
      }
      // There are pattern segments in the suffix, skip them.
      switch (segment.type) {
        case "literal":
          node = node.literalChildren.get(segment.literal)!;
          break;
        case "pattern":
          node = node.patternChildren.get(segment.literal)!.node;
          break;
      }
    }
  }

  /**
   * Finds route matching the given path and method.
   */
  static find(
    root: Node,
    path: string,
    method: string,
    params: MatchedPathParams,
  ): Match | typeof kNotFound | typeof kMethodNotAllowed {
    let node = root;

    // Split the input path into segments by the slash character,
    // navigate the prefix tree from the root to the children
    // by consuming one segment at a time.
    let child: Node | null;
    if (path === "/") {
      child = node.literalChildren.get("/") ?? null;
      if (child == null) {
        return kNotFound;
      }
      node = child;
    } else {
      let pos = 1;
      while (pos < path.length) {
        // Try to find a child using shortcut.
        const suffix = path.substring(pos);
        child = node.literalChildren.get(suffix) ?? null;
        if (child != null) {
          node = child;
          break;
        }

        // Try to find a child level by level.
        let segment: string;
        const i = path.indexOf("/", pos);
        if (i !== -1) {
          segment = path.substring(pos, i + 1);
          pos = i + 1;
        } else {
          segment = path.substring(pos);
          pos = path.length;
        }
        child = node.match(segment, params);
        if (child == null) {
          return kNotFound;
        }
        node = child;
      }
    }

    const { routesByMethod } = node;
    if (routesByMethod.size === 0) {
      return kNotFound;
    }
    const route = routesByMethod.get(method) ?? routesByMethod.get("*") ?? null;
    if (route == null) {
      return kMethodNotAllowed;
    }
    return { path, method, route, params };
  }
}

export interface Match {
  /**
   * Matched path.
   */
  readonly path: string;
  /**
   * Matched HTTP method.
   */
  readonly method: string;
  /**
   * Matched route.
   */
  readonly route: Route;
  /**
   * Parameters collected from the matched path.
   */
  readonly params: Readonly<MatchedPathParams>;
}
