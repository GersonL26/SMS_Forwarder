describe('Configuración del proyecto', () => {
  it('debe ejecutar tests correctamente', () => {
    expect(true).toBe(true);
  });

  it('debe tener TypeScript configurado', () => {
    const suma = (a: number, b: number): number => a + b;
    expect(suma(2, 3)).toBe(5);
  });
});
