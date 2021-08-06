/// <reference types="Cypress" />

const testName = "gameobject-collide-tiles";

context(`Run ${testName}`, () => {
  it("should run with no errors", () => {
    cy.runPhaserTest(`/tests/${testName}`);
  });
});
