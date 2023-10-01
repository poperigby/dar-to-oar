import { invoke } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

type ConverterArgs = {
  src: string;
  dist?: string;
  modName?: string;
  modAuthor?: string;
  mappingPath?: string;
  mapping1personPath?: string;
  logLevel?: LogLevel;
};

/**
 * Convert DAR to OAR
 * # Throw Error
 */
export async function convertDar2oar(props: ConverterArgs): Promise<void> {
  const src = props.src === "" ? undefined : props.src;
  const dist = props.dist === "" ? undefined : props.dist;
  const modName = props.modName === "" ? undefined : props.modName;
  const modAuthor = props.modAuthor === "" ? undefined : props.modAuthor;

  try {
    await invoke("convert_dar2oar", {
      darModFolder: src,
      oarModFolder: dist,
      modName,
      modAuthor,
      mappingPath: props.mappingPath,
      mapping1personPath: props.mapping1personPath,
      logLevel: props.logLevel,
    });
  } catch (e) {
    throw new Error(`${e}`);
  }
}

/**
 * Open a file or Dir
 * # Throw Error
 */
export async function openPath(
  path: string,
  setPath: (path: string) => void,
  isDir: boolean
) {
  const res = await open({
    defaultPath: path,
    directory: isDir,
  });

  if (typeof res === "string") {
    //! NOTE:
    //! It is important to use setter here!
    //! If we don't get the result within this function, somehow the previous value comes in.
    setPath(res);
  }
}
