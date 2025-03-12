import fetchAllGroups from "../fetchAllGroups";
import {expect} from "@jest/globals";

describe('FetchGroups', () => {
    it('should return the correct number of groups', async () => {
        const groupsArray = await fetchAllGroups();

        if (groupsArray) {
            expect(groupsArray.length).toBe(4)
        } else {
            expect(groupsArray).toStrictEqual(null);
        }
    })

    it('should return an empty array with an error', () => {

    })
})