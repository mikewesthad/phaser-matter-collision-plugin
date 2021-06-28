/// <reference types="Cypress" />

const testName = "gameobject-collide-gameobject";

context(`Run ${testName}`, () => {
  it("should run with no errors", () => {
    cy.runPhaserTest(`/tests/${testName}`);
  });
});
