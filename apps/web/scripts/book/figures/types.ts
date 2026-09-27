export interface BookFigure {
  /** Stable id, used for cross references and the list of figures. */
  id: string;
  /** Lecture category key, e.g. `binary_search`. */
  category: string;
  /**
   * Exact section title as authored (e.g. `2.1 基礎`), or `""` for the
   * chapter's root summary.
   */
  section: string;
  /**
   * Skeleton heading the figure is inserted under. The figure goes right after
   * the first paragraph of that heading's body. Defaults to `核心想法與直覺`;
   * falls back to the top of the section when the heading is missing.
   */
  anchor?: string;
  caption: string;
  render: () => string;
}
