// Importamos la función getData y axios
import { getData } from '../src/Swapi'; // Ajusta la ruta si es necesario
import axios from 'axios';

// Mock de axios
jest.mock('axios');

describe('getData function', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Para evitar que los errores se impriman en la consola durante las pruebas
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restauramos todos los mocks después de cada prueba
  });

  it('should fetch and return characters with correct fields', async () => {
    // Simulamos una respuesta de axios
    const mockResponse = {
      data: {
        results: [
          { name: 'Luke Skywalker', height: '172', eye_color: 'blue', gender: 'male' },
          { name: 'C-3PO', height: '167', eye_color: 'yellow', gender: 'n/a' },
          { name: 'R2-D2', height: '96', eye_color: 'red', gender: 'n/a' },
          { name: 'Darth Vader', height: '202', eye_color: 'yellow', gender: 'male' },
          { name: 'Leia Organa', height: '150', eye_color: 'brown', gender: 'female' },
        ],
        next: null,
      },
    };

    // Mockeamos axios para que devuelva esta respuesta simulada
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    // Llamamos a la función getData
    const result = await getData({} as any);

    // Verificamos que la respuesta sea correcta
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).data).toEqual([
      { nombres: 'Luke Skywalker', altura: '172', color_ojos: 'blue', genero: 'male' },
      { nombres: 'C-3PO', altura: '167', color_ojos: 'yellow', genero: 'n/a' },
      { nombres: 'R2-D2', altura: '96', color_ojos: 'red', genero: 'n/a' },
      { nombres: 'Darth Vader', altura: '202', color_ojos: 'yellow', genero: 'male' },
      { nombres: 'Leia Organa', altura: '150', color_ojos: 'brown', genero: 'female' },
    ]);
  });

  it('should handle API errors', async () => {
    // Simulamos un error en la solicitud de axios
    (axios.get as jest.Mock).mockRejectedValue(new Error('API request failed'));

    // Llamamos a la función getData
    const result = await getData({} as any);

    // Verificamos que el error sea manejado correctamente
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Error getting data');
  });
});