/// <reference types="Cypress" />

const testName = "collision-events";

context(`Run ${testName}`, () => {
  it("should run with no errors", () => {
    cy.runPhaserTest(`/tests/${testName}`);
  });
});
