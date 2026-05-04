import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for the AST Editor.
 *
 * Encapsulates all user interactions with the editor UI.
 * data-testid selectors here define the contract between E2E tests and UI implementation.
 */
export class EditorPage {
  readonly page: Page;

  // --- Panes ---
  readonly structurePane: Locator;
  readonly constraintPane: Locator;
  readonly previewPane: Locator;

  // --- Structure interactions ---
  readonly insertionHotspots: Locator;
  readonly nodePopup: Locator;

  constructor(page: Page) {
    this.page = page;
    this.structurePane = page.getByTestId('structure-pane');
    this.constraintPane = page.getByTestId('constraint-pane');
    this.previewPane = page.getByTestId('preview-pane');
    this.insertionHotspots = page.getByTestId(/^insertion-hotspot/);
    this.nodePopup = page.getByTestId('node-popup');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  // ── Structure operations ──────────────────────────────────────────

  async clickHotspot(
    direction: 'below' | 'right' | 'inside' = 'below',
  ): Promise<void> {
    await this.page
      .getByTestId(`insertion-hotspot-${direction}`)
      .first()
      .click();
  }

  getStructureNodeByLabel(label: string): Locator {
    return this.structurePane.locator('.structure-node').filter({
      has: this.page.locator('.node-label', { hasText: label }),
    }).first();
  }

  async clickHotspotForNode(
    label: string,
    direction: 'right' | 'inside' | 'variant' = 'right',
  ): Promise<void> {
    await this.getStructureNodeByLabel(label)
      .getByTestId(`insertion-hotspot-${direction}`)
      .click();
  }

  async selectPopupOption(option: string): Promise<void> {
    await this.nodePopup.waitFor({ state: 'visible' });
    await this.page.getByTestId(`popup-option-${option}`).click();
  }

  async inputName(name: string): Promise<void> {
    await this.page.getByTestId('name-input').fill(name);
  }

  async selectType(type: string): Promise<void> {
    await this.page.getByTestId('type-select').selectOption(type);
  }

  async selectLength(varName: string): Promise<void> {
    await this.page.getByTestId('length-select').selectOption(varName);
  }

  async pickLengthVar(varName: string): Promise<void> {
    await this.page.getByTestId(`length-var-option-${varName}`).click();
  }

  async fillLengthExpression(value: string): Promise<void> {
    await this.page.getByTestId('length-expression-input').fill(value);
  }

  async pickCountVar(varName: string): Promise<void> {
    await this.page.getByTestId(`count-var-option-${varName}`).click();
  }

  /**
   * Build an expression by selecting a variable and applying an operation.
   *
   * Flow: click count field → select variable → click variable in expression
   *       → select operation → enter operand → press Enter
   *
   * Example: buildCountExpression('N', 'subtract', '1') → N - 1
   */
  async buildCountExpression(
    baseVar: string,
    op: string,
    operand: string,
  ): Promise<void> {
    // 1. Click the count field to open variable list
    await this.page.getByTestId('count-field').click();
    // 2. Select the base variable
    await this.pickCountVar(baseVar);
    // 3. Click the variable element in the expression to open function popup
    await this.page.getByTestId(`expression-element-${baseVar}`).click();
    // 4. Select the operation (e.g., subtract, add, multiply, divide, min, max)
    await this.page.getByTestId(`function-op-${op}`).click();
    // 5. Enter the operand value and confirm
    await this.page.getByTestId('function-operand-input').fill(operand);
    await this.page.getByTestId('function-operand-input').press('Enter');
  }

  async confirm(): Promise<void> {
    await this.page.getByTestId('confirm-button').click();
  }

  async closePopupByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  /**
   * High-level helper: add a scalar variable to the structure.
   */
  async addScalar(name: string, type: string = 'number'): Promise<void> {
    await this.clickHotspot('below');
    await this.selectPopupOption('scalar');
    await this.selectType(type);
    await this.inputName(name);
    await this.confirm();
  }

  /**
   * High-level helper: add a scalar to the right of the current node (same line).
   */
  async addScalarRight(name: string, type: string = 'number'): Promise<void> {
    await this.clickHotspot('right');
    await this.selectPopupOption('scalar');
    await this.selectType(type);
    await this.inputName(name);
    await this.confirm();
  }

  /**
   * High-level helper: add a horizontal array to the structure.
   */
  async addArray(
    name: string,
    lengthVar: string,
    type: string = 'number',
  ): Promise<void> {
    await this.clickHotspot('below');
    await this.selectPopupOption('array');
    await this.selectType(type);
    await this.inputName(name);
    await this.pickLengthVar(lengthVar);
    await this.confirm();
  }

  // ── Constraint operations ─────────────────────────────────────────

  getDraftConstraints(): Locator {
    return this.constraintPane.getByTestId(/^draft-constraint/);
  }

  getCompletedConstraints(): Locator {
    return this.constraintPane.getByTestId(/^completed-constraint/);
  }

  /**
   * Open a draft constraint for editing.
   */
  async openDraft(index: number): Promise<void> {
    await this.page.getByTestId(`draft-constraint-${index}`).click();
  }

  /**
   * Enter a literal positive integer into a constraint bound.
   * Click the bound area → free integer input → Enter.
   */
  async fillBoundLiteral(
    bound: 'lower' | 'upper',
    value: string,
  ): Promise<void> {
    await this.page.getByTestId(`constraint-${bound}-input`).click();
    await this.page.getByTestId('constraint-value-literal').fill(value);
    await this.page.getByTestId('constraint-value-literal').press('Enter');
  }

  /**
   * Select a variable reference for a constraint bound.
   * Click the bound area → select variable from popup list.
   */
  async fillBoundVar(
    bound: 'lower' | 'upper',
    varName: string,
  ): Promise<void> {
    await this.page.getByTestId(`constraint-${bound}-input`).click();
    await this.page.getByTestId(`constraint-var-option-${varName}`).click();
  }

  /**
   * Apply a function to the current expression element in a constraint bound.
   * Click the expression element → function popup → select op → enter operand.
   *
   * The operand must be a positive integer (free input).
   */
  async applyBoundFunction(
    bound: 'lower' | 'upper',
    op: string,
    operand: string,
  ): Promise<void> {
    await this.page.getByTestId(`constraint-${bound}-expression`).click();
    await this.page.getByTestId(`function-op-${op}`).click();
    await this.page.getByTestId('function-operand-input').fill(operand);
    await this.page.getByTestId('function-operand-input').press('Enter');
  }

  /**
   * Confirm the current constraint editing.
   */
  async confirmConstraint(): Promise<void> {
    await this.page.getByTestId('constraint-confirm').click();
  }

  async addProperty(propertyName: string): Promise<void> {
    await this.page.getByTestId('property-shortcut').click();
    await this.page.getByTestId(`property-option-${propertyName}`).click();
  }

  /**
   * Add a SumBound constraint.
   * The upper bound uses the same structured value input as constraint bounds.
   */
  async addSumBound(varName: string, upper: string): Promise<void> {
    await this.page.getByTestId('sumbound-shortcut').click();
    await this.page.getByTestId('sumbound-var-select').selectOption(varName);
    await this.page.getByTestId('sumbound-upper-input').click();
    await this.page.getByTestId('constraint-value-literal').fill(upper);
    await this.page.getByTestId('constraint-value-literal').press('Enter');
    await this.page.getByTestId('constraint-confirm').click();
  }

  /**
   * Add a SumBound constraint with an expression upper bound (e.g., 2 * 10^5).
   */
  async addSumBoundExpression(
    varName: string,
    baseValue: string,
    op: string,
    operand: string,
  ): Promise<void> {
    await this.page.getByTestId('sumbound-shortcut').click();
    await this.page.getByTestId('sumbound-var-select').selectOption(varName);
    await this.page.getByTestId('sumbound-upper-input').click();
    await this.page.getByTestId('constraint-value-literal').fill(baseValue);
    await this.page.getByTestId('constraint-value-literal').press('Enter');
    // Apply function to the upper bound expression
    await this.page.getByTestId('sumbound-upper-expression').click();
    await this.page.getByTestId(`function-op-${op}`).click();
    await this.page.getByTestId('function-operand-input').fill(operand);
    await this.page.getByTestId('function-operand-input').press('Enter');
    await this.page.getByTestId('constraint-confirm').click();
  }

  // ── Right pane (Preview) assertions ───────────────────────────────

  getTexInputFormat(): Locator {
    return this.page.getByTestId('tex-input-format');
  }

  getTexConstraints(): Locator {
    return this.page.getByTestId('tex-constraints');
  }

  getSampleOutput(): Locator {
    return this.page.getByTestId('sample-output');
  }

  getSampleStatus(): Locator {
    return this.page.getByTestId('sample-status');
  }

  // ── Math editing ──────────────────────────────────────────────────

  async clickMathElement(id: string): Promise<void> {
    await this.page.getByTestId(`math-editable-${id}`).click();
  }

  async editMathValue(value: string): Promise<void> {
    await this.page.getByTestId('math-editor-input').fill(value);
    await this.page.getByTestId('math-editor-confirm').click();
  }

  /**
   * High-level helper: add a weighted edge list template.
   * Uses the weighted-edge-list popup option with count variable and weight name.
   * Unlike tree edge-list which uses buildCountExpression('N','subtract','1'),
   * graph patterns use selectLength directly since edge count M is a simple variable.
   */
  async addWeightedEdgeList(
    countVar: string,
    weightName: string = 'w',
    weightType: string = 'number',
  ): Promise<void> {
    await this.clickHotspot('below');
    await this.selectPopupOption('weighted-edge-list');
    await this.selectLength(countVar);
    await this.page.getByTestId('weight-name-input').fill(weightName);
    await this.selectType(weightType);
    await this.confirm();
  }
}
