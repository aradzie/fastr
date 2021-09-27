export interface MetadataKey<T> {
  readonly id: string | symbol;
}

export function newMetadataKey<T>(id: string | symbol): MetadataKey<T> {
  return { id };
}

export abstract class Metadata {
  static forClass(target: Function) {
    return new (class extends Metadata {
      get<T>(metadataKey: MetadataKey<T>): T | undefined {
        return Reflect.getOwnMetadata(metadataKey.id, target);
      }

      set<T>(metadataKey: MetadataKey<T>, metadataValue: T): void {
        Reflect.defineMetadata(metadataKey.id, metadataValue, target);
      }
    })();
  }

  static forProperty(target: object, propertyKey: string | symbol) {
    return new (class extends Metadata {
      get<T>(metadataKey: MetadataKey<T>): T | undefined {
        return Reflect.getOwnMetadata(metadataKey.id, target, propertyKey);
      }

      set<T>(metadataKey: MetadataKey<T>, metadataValue: T): void {
        Reflect.defineMetadata(
          metadataKey.id,
          metadataValue,
          target,
          propertyKey,
        );
      }
    })();
  }

  abstract get<T>(metadataKey: MetadataKey<T>): T | undefined;

  abstract set<T>(metadataKey: MetadataKey<T>, metadataValue: T): void;

  update<T>(metadataKey: MetadataKey<T>, cb: (value?: T | undefined) => T) {
    this.set(metadataKey, cb(this.get(metadataKey)));
  }
}
