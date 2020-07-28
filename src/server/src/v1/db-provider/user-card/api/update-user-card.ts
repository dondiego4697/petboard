import * as Knex from 'knex';
import {dbManager} from 'server/lib/db-manager';
import {DbTable, FarmType} from 'server/types/consts';
import {DBTableUserCard} from 'server/types/db/user-card';

interface Params {
    cityId: number;
	contacts: DBTableUserCard.FieldContacts;
	name: string;
	description?: string;
	address?: string;
	type: FarmType;
}

const knex = Knex({client: 'pg'});

export async function updateUserCard(userId: number, params: Params): Promise<void> {
	const {
		cityId, contacts, name,
		description, address, type
	} = params;

	const query = knex(DbTable.USER_CARD)
		.update({
			city_id: cityId,
			contacts: JSON.stringify(contacts),
			name,
			type,
			description,
			address
		})
		.where({
			user_id: userId
		});

	await dbManager.executeModifyQuery(query.toString());
}