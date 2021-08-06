/// <reference types="Cypress" />

const testName = "pair-collision-events";

context(`Run ${testName}`, () => {
  it("should run with no errors", () => {
    cy.runPhaserTest(`/tests/${testName}`);
  });
});
