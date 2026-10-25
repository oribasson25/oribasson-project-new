/*
 * One file per project, so a single diagram can be reverted on its own.
 * Each file exports { id, spec }. Labels stay inside that project's wording.
 */
const modules = import.meta.glob('./diagrams/*.js', { eager: true });

export const architectures = Object.fromEntries(
  Object.values(modules).map((mod) => [mod.id, mod.spec]),
);
