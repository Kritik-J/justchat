export function singleton<T>(name: string, getValue: () => T): T {
  const thusly = globalThis as any;
  thusly.__quest_singletons ??= {};
  thusly.__quest_singletons[name] ??= getValue();
  return thusly.__quest_singletons[name];
}
