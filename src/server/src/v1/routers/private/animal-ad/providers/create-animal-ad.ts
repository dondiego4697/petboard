import * as Boom from '@hapi/boom';
import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {AnimalDbProvider} from 'server/v1/db-provider/animal';
import {AnimalAdDbProvider} from 'server/v1/db-provider/animal-ad';
import {DBTableAnimalAd} from 'server/types/db/animal-ad';
import {logger} from 'server/lib/logger';
import {GeoDbProvider} from 'server/v1/db-provider/geo';

export interface Body {
    documents: DBTableAnimalAd.FieldDocuments;
    isBasicVaccinations: boolean;
    description: string;
    title: string;
    cost: number;
    sex: DBTableAnimalAd.FieldSex;
    animalBreedCode: string;
    cityCode: string;
    address?: string;
    imageUrls: string[];
    birthday?: Date;
}

export const createAnimalAd = wrap<Request, Response>(async (req, res) => {
    const {
        documents,
        address,
        isBasicVaccinations,
        title,
        description,
        cost,
        sex,
        animalBreedCode,
        cityCode,
        imageUrls,
        birthday
    } = req.body as Body;

    const [animalBreed, city] = await Promise.all([
        AnimalDbProvider.getAnimalBreedByCode(animalBreedCode),
        GeoDbProvider.getCityByCityCode(cityCode)
    ]);

    if (!animalBreed) {
        logger.error(`invalid animal breed code: ${animalBreedCode}`);
        throw Boom.badRequest();
    }

    if (!city) {
        logger.error(`invalid city code: ${cityCode}`);
        throw Boom.badRequest();
    }

    const {id, publicId} = await AnimalAdDbProvider.createAnimalAd({
        title,
        address,
        description,
        isBasicVaccinations,
        documents,
        cost,
        sex,
        birthday,
        animalBreedId: animalBreed.id,
        cityId: city.id,
        ownerId: req.userData.id
    });

    if (imageUrls.length > 0) {
        await AnimalAdDbProvider.updateAnimalAdImages({
            animalAdId: id,
            forInsertUrls: imageUrls,
            forDeleteUrls: []
        });
    }

    res.json({publicId});
});
