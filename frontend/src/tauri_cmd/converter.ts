import { invoke } from '@tauri-apps/api';

import { selectLogLevel } from '@/utils/selector';

type ConverterOptions = {
  src: string;
  dst?: string;
  modName?: string;
  modAuthor?: string;
  mappingPath?: string;
  mapping1personPath?: string;
  runParallel?: boolean;
  hideDar?: boolean;
  showProgress?: boolean;
};

/**
 * Converts a DAR (DynamicAnimationReplacer) to an OAR (OpenAnimationReplacer).
 * @param {ConverterOptions} props - Converter Options.
 * @returns {Promise<void>} A promise that resolves when converted.
 * @throws
 * - `props.src` is '' or non-exist as  path
 * - Convert is failed.
 */
export async function convertDar2oar(props: ConverterOptions): Promise<void> {
  if (props.src === '') {
    throw new Error('src must be specified.');
  }

  const args = {
    options: {
      darDir: props.src,
      oarDir: props.dst === '' ? undefined : props.dst,
      modName: props.modName === '' ? undefined : props.modName,
      modAuthor: props.modAuthor === '' ? undefined : props.modAuthor,
      mappingPath: props.mappingPath === '' ? undefined : props.mappingPath,
      mapping1personPath: props.mapping1personPath === '' ? undefined : props.mapping1personPath,
      runParallel: props.runParallel ?? false,
      hideDar: props.hideDar ?? false,
    },
  };

  let logLevel = selectLogLevel(localStorage.getItem('logLevel'));
  changeLogLevel(logLevel);

  const showProgress = props.showProgress ?? false;
  //! Warning! If there is no `return` or `await` in invoke, the progress bar will not work.
  if (showProgress) {
    await invoke('convert_dar2oar_with_progress', args);
  } else {
    await invoke('convert_dar2oar', args);
  }
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * Invokes the `change_log_level` command with the specified log level.
 * @param {LogLevel} [logLevel] - The log level to set. If not provided, the default log level will be used.
 * @returns {Promise<void>} A promise that resolves when the log level is changed.
 */
export async function changeLogLevel(logLevel?: LogLevel): Promise<void> {
  return invoke('change_log_level', { logLevel });
}

/**
 * Add `.mohidden` to DAR's files.
 * @param {string} darDir - A string representing the directory path of the DAR directory that needs to be
 * unhidden.
 * @throws
 */
export async function unhideDarDir(darDir: string) {
  if (darDir === '') {
    throw new Error('darDir is empty string.');
  }
  await invoke('unhide_dar_dir', { darDir });
}

/**
 * The function `removeOarDir` is an asynchronous function that removes a specified directory and throws an error if the
 * path is empty.
 * @param {string} path - The `path` parameter is a string that specifies the directory path of the DAR or OAR directory
 * that needs to be removed.
 * @throws
 */
export async function removeOarDir(path: string) {
  if (path === '') {
    throw new Error('Specified path is empty string.');
  }
  await invoke('remove_oar_dir', { path });
}
