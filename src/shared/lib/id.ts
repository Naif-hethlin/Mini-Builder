import { nanoid } from "nanoid";

/**
 * Generates a short unique ID for sections, components, rows, and columns.
 *
 * 10 chars is plenty — at our scale, two collisions are astronomically unlikely
 * (you'd need billions of IDs before a clash becomes meaningful).
 */
export const newId = (): string => nanoid(10);
