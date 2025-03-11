import { GET, POST } from "@/app/api/groups/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";
import { getUserID, getGroup } from "@/lib/helper";
import { expect, describe, it, beforeEach } from '@jest/globals';

 //const { expect, describe, it, beforeEach } = require('@jest/globals');

 jest.mock('@/lib/database/dbConnect');
 jest.mock('jsonwebtoken');
 jest.mock('@/lib/models/Group');
 jest.mock('@/lib/models/User');
 
 describe('Groups API Route', () => {
   const mockRequest = {
     cookies: {
       get: jest.fn(),
     },
     json: jest.fn(),
   } as unknown as NextRequest;
 
   const mockUser = {
     _id: 'user123',
     favouriteGroups: ['group1', 'group2'],
   };
 
   const mockGroups = [
     { _id: 'group1', groupname: 'Group 1', beschreibung: 'Desc 1', members: ['user123'] },
     { _id: 'group2', groupname: 'Group 2', beschreibung: 'Desc 2', admins: ['user123'] },
     { _id: 'group3', groupname: 'Group 3', beschreibung: 'Desc 3', members: ['otherUser'] },
   ];
 
   beforeEach(() => {
     jest.clearAllMocks();
     (dbConnect as jest.Mock).mockResolvedValue(true);
     (User.findById as jest.Mock).mockResolvedValue({
      _id: mockUser._id,
      favouriteGroups: mockUser.favouriteGroups.map((id) => ({ toString: () => id })),
     });
     (Group.find as jest.Mock).mockResolvedValue(mockGroups);
     (Group.findById as jest.Mock).mockResolvedValue(mockGroups[0]);
   });
 
   describe('GET', () => {
     it('should return groups with favourite status (true or false)', async () => {
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'validToken' });
       (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({ favouriteGroups: mockUser.favouriteGroups.map((id) => ({ toString: () => id })) }),
      });

      (Group.find as jest.Mock).mockImplementation((query) => ({
        select: jest.fn().mockImplementation((fields) => ({
          lean: jest.fn().mockResolvedValue(
            mockGroups.filter(group => 
              (group.members?.includes(mockUser._id) || group.admins?.includes(mockUser._id))
            ).map(group =>
              Object.fromEntries(Object.entries(group).filter(([key]) => fields.split(" ").includes(key)))
            )
          ),
        })),
      }));
      
       const response = await GET(mockRequest);
       const data = await response.json();
 
       expect(data.success).toBe(true);
       expect(data.data).toEqual([
        { _id: "group1", groupname: "Group 1", beschreibung: "Desc 1", members: ["user123"], isFavourite: true },
        { _id: "group2", groupname: "Group 2", beschreibung: "Desc 2" , isFavourite: true },
       ]);
     });
 
     it('should return error when user is not authenticated', async () => {
       (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined);
       const response = await GET(mockRequest);
       const data = await response.json();
 
       expect(data.success).toBe(false);
       expect(data.error).toBe('Nicht authentifiziert');
     });
   });
 
   describe('POST', () => {
     it('should create a new group', async () => {
       (mockRequest.json as jest.Mock).mockResolvedValue({ groupname: 'New Group', beschreibung: 'New Desc' });
       (Group.prototype.save as jest.Mock).mockResolvedValue({ _id: 'newGroup123', groupname: 'New Group', beschreibung: 'New Desc', creator: 'user123', admins: ['user123'], members: ['user123'] });
       (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'validToken' });
       (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
 
       const response = await POST(mockRequest);
       const data = await response.json();;
 
       expect(data.success).toBe(true);
       expect(data.data).toEqual({ _id: 'newGroup123', groupname: 'New Group', beschreibung: 'New Desc', creator: 'user123', admins: ['user123'], members: ['user123'] });
     });
 
     it('should return error when groupname is missing', async () => {
       (mockRequest.json as jest.Mock).mockResolvedValue({});
       const response = await POST(mockRequest);
       const data = await response.json();
 
       expect(data.success).toBe(false);
       expect(data.error).toBe('Groupname ist erforderlich.');
     });
   });
 });
