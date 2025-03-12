import { postProfilePicture } from '../postProfilePicture';
import { expect, describe, it, beforeEach, afterEach } from '@jest/globals';

// Test-Daten
const userId = '123';
const base64String = 'base64String';
const mockSuccessResponse = { success: true };
const mockErrorResponse = { error: 'Upload failed' };

describe('postProfilePicture', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sollte das Profilbild erfolgreich hochladen', async () => {
    await expect(postProfilePicture(userId, base64String)).resolves.not.toThrow();

    expect(fetch).toHaveBeenCalledWith(`/api/user/${userId}/uploadProfilePic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, image: base64String }),
    });
  });

  it('sollte einen Fehler werfen, wenn der Upload fehlschlägt', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(mockErrorResponse),
      })
    ) as jest.Mock;

    await expect(postProfilePicture(userId, base64String)).rejects.toThrow('Upload failed');

    expect(fetch).toHaveBeenCalledWith(`/api/user/${userId}/uploadProfilePic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, image: base64String }),
    });
  });
});