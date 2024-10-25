const BASE_URL = 'http://127.0.0.1:8000';
const FILE_URL = BASE_URL + '/files';
const FILE_UPLOAD_URL = FILE_URL + '/upload';
const FILE_LIST_URL = FILE_URL + '/list';

const ASK_GPT_URL = BASE_URL + '/ask-gpt';

const FILE_ROWS_PATH = 'rows';
const FILE_INSIGHTS_PATH = 'insights';

export enum responseStatus {
  OK,
  ERROR
}

interface apiResponse {
  status: responseStatus,
  data: any
}

export const uploadFile = async (file: File): Promise<apiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const config = {
      method: 'POST',
      body: formData
    };

    const response = await fetch(FILE_UPLOAD_URL, config);
    if (!response.ok) {
      throw new Error('Oops! failed to upload the file');
    }

    const responseJson = await response.json();
    return { status: responseStatus.OK, data: responseJson.data };
  } catch (error: Error) {
    alert(error.message);
    return { status: responseStatus.ERROR, data: null };
  }
};

export const getFileList = async (): Promise<apiResponse> => {
  try {
    const response = await fetch(FILE_LIST_URL, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Oops! Failed to retrieve file list');
    }

    const responseJson = await response.json();
    return { status: responseStatus.OK, data: responseJson.data };
  } catch (error: Error) {
    alert(error.message);
    return { status: responseStatus.ERROR, data: null };
  }
};

export const getFileRows = async (fileId: string, skip: number = 0, limit: number = 10): Promise<apiResponse> => {
  try {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });

    const finalUrl = `${FILE_URL}/${fileId}/${FILE_ROWS_PATH}?${params.toString()}`;

    const response = await fetch(finalUrl, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Oops! Failed to retrieve file rows');
    }

    const responseJson = await response.json();
    return { status: responseStatus.OK, data: responseJson.data };
  } catch (error: Error) {
    alert(error.message);
    return { status: responseStatus.ERROR, data: null };
  }
};

export const getFileInsights = async (fileId: string): Promise<apiResponse> => {
  try {

    const finalUrl = `${FILE_URL}/${fileId}/${FILE_INSIGHTS_PATH}`;

    const response = await fetch(finalUrl, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Oops! Failed to retrieve file insights');
    }

    const responseJson = await response.json();
    return { status: responseStatus.OK, data: responseJson.data };
  } catch (error: Error) {
    alert(error.message);
    return { status: responseStatus.ERROR, data: null };
  }
};

export const getGptResponse = async (fileId: string, columnName: string): Promise<apiResponse> => {
  try {

    const finalUrl = ASK_GPT_URL;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const config = {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId, column_name: columnName }),
      headers: headers
    };

    const response = await fetch(finalUrl, config);

    if (!response.ok) {
      throw new Error('Oops! Failed to retrieve ChatGPT response');
    }

    const responseJson = await response.json();
    return { status: responseStatus.OK, data: responseJson.data };
  } catch (error: Error) {
    alert(error.message);
    return { status: responseStatus.ERROR, data: null };
  }
};