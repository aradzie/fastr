import { launch } from "./server/routes";

launch().catch((err) => {
  console.error(err);
});
