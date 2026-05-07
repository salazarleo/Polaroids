type EnvSource = Record<string, string | undefined>;

export function getServerEnv(name: string): string | undefined {
  const processEnv: EnvSource =
    typeof process !== "undefined" ? process.env : {};
  const metaEnv: EnvSource =
    (import.meta as ImportMeta & { env?: EnvSource }).env ?? {};

  return processEnv[name] ?? metaEnv[name];
}

export function getFirstServerEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = getServerEnv(name);
    if (value) return value;
  }

  return undefined;
}
