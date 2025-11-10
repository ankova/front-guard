export interface FlagsSource {
  load(): Promise<Record<string, boolean>>;
}

export interface FlagsClient {
  isEnabled(flag: string): boolean;
  reload(): Promise<void>;
}

export const createFlagsClient = (source: FlagsSource): FlagsClient => {
  let flags: Record<string, boolean> = {};

  const isEnabled = (flag: string): boolean => Boolean(flags[flag]);

  const reload = async () => {
    flags = await source.load();
  };

  void reload();

  return { isEnabled, reload };
};
