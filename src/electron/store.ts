import Store from "electron-store";

// const schema = {
//   backupEnabled: {
//     type: "boolean",
//     default: false,
//   },
//   backupPath: {
//     type: "string",
//     default: "",
//   },
// };

const store = new Store();
// store.set("backupEnabled", false);
// store.set("backupPath", "");

export default store;
