import {
  filenameFromUri,
  mimeTypeFromFilename,
  reactNativeFormDataFile,
} from '../../lib/uploads/form-data-file';

describe('React Native FormData file helpers', () => {
  it('extracts filename from URI', () => {
    expect(filenameFromUri('file:///cache/photo%20proof.jpg')).toBe('photo proof.jpg');
    expect(filenameFromUri('content://media/external/images/media/1')).toBe('upload.jpg');
  });

  it('maps extensions to MIME types', () => {
    expect(mimeTypeFromFilename('receipt.png')).toBe('image/png');
    expect(mimeTypeFromFilename('dlt.pdf')).toBe('application/pdf');
    expect(mimeTypeFromFilename('unknown')).toBe('image/jpeg');
  });

  it('builds React Native FormData file parts', () => {
    expect(
      reactNativeFormDataFile('file:///cache/IMG_0001.jpeg', undefined, undefined),
    ).toEqual({
      uri: 'file:///cache/IMG_0001.jpeg',
      name: 'IMG_0001.jpeg',
      type: 'image/jpeg',
    });
  });
});
