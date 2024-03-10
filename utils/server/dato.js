import { SiteClient, buildModularBlock } from 'datocms-client';

const API_TOKEN = process.env.DATOCMS_API_TOKEN;

const client = new SiteClient(API_TOKEN);

export const getRecord = async (recordId) => {
    try {
        return await client.items.find(recordId, {
            version: 'published'
        });
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const createUpload = async (file) => {
    try {
        const path = await client.createUploadPath(file);
        return await client.uploads.create({ path });
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const createRecord = async (recordData) => {
    try {
        return await client.items.create(recordData);
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const updateRecord = async (recordId, recordData) => {
    try {
        return await client.items.update(`${recordId}`, recordData);
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const publish = async (recordId) => {
    try {
        return await client.items.publish(`${recordId}`);
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const listAllTypes = async () => {
    try {
        return await client.itemTypes.all();
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const getField = async (fieldIdOrApiKey) => {
    try {
        return await client.fields.find(fieldIdOrApiKey);
    } catch (error) {
        console.error(error);
        return { error };
    }
};

export const buildBlock = buildModularBlock;
