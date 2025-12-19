import { federation } from "../fedify";

export default defineEventHandler(async (event) => {
  //console.info(`[Fedify Middleware]`);

  const request = new Request(getRequestURL(event));

  const result = await federation.fetch(request, {
    contextData: undefined,
  });

  if (result.status < 300) {
    return result;
  }
});
