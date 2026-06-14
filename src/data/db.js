// Mock database deleted. All data now comes directly from microservice APIs.
export const getDB = () => {
  throw new Error("getDB is deprecated and should not be used anymore.");
};
