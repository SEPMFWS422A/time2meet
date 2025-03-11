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
     it('should return groups with favourite status', async () => {
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


 /*
const mockJsonResponse = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, options?: any) => {
      const response = {
        status: options?.status || 200,
        json: async () => data,
      };
      mockJsonResponse(data, options);
      return response;
    },
  },
}));

class MockHttpRequest {
  private body: any;

  constructor(body = {}) {
    this.body = body;
  }

  async json() {
    return this.body;
  }
}

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Group");
jest.mock("@/lib/models/User");
jest.mock("@/lib/helper", () => ({
  getUserID: jest.fn(),
}));


describe("API Routes: /api/groups", () => {

  const testUserId = "testUser";
  const testGroupId = "testGroup";

  beforeEach(() => {
    jest.clearAllMocks();
    mockJsonResponse.mockClear();
    (dbConnect as jest.Mock).mockResolvedValue(undefined);
  });

  describe("GET /api/groups", () => {
    it("should return a list of groups where user is a member or admin", async () => {
        (getUserID as jest.Mock).mockResolvedValueOnce({ id: testUserId });
    
        (User.findById as jest.Mock).mockImplementationOnce((id: string) => {
          if (id === testUserId) {
            return {
              _id: id,
              select: jest.fn().mockImplementation(() => Promise.resolve({ favouriteGroups: ["group1", "group2"] })
            ),
            };
          }
          return null;
        });
      
        (Group.find as jest.Mock).mockImplementationOnce((query) => {
          console.log("Mocked Group.find() called with:", query); 
        
          if (JSON.stringify(query) === JSON.stringify({ $or: [{ members: testUserId }, { admins: testUserId }] })) {
            return {
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([
                { _id: "group1", groupname: "Group One", beschreibung: "Test 1", members: [testUserId] },
                { _id: "group2", groupname: "Group Two", beschreibung: "Test 2", members: [testUserId] },
              ]),
            };
          }
          return { select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) };
        });
        
        
        console.log("Mocked Group.find().exec():", await Group.find().select("_id groupname beschreibung members").lean().exec());
          
          
        const request = mockDeep<NextRequest>();
        const response = await GET(request);
        const jsonResponse = await response.json();
        
        console.log("Request:", request);
        console.log("Response status:", response.status);
        console.log("API Json response:", jsonResponse);

        expect(dbConnect).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalledWith(testUserId);
        expect(Group.find).toHaveBeenCalledWith({ $or: [{ members: testUserId }, { admins: testUserId }] });
        expect(response.status).toBe(200);
        expect(jsonResponse.success).toBe(true);
        expect(jsonResponse.data).toHaveLength(2);
        expect(jsonResponse.data[0].isFavourite).toBe(true);
        expect(jsonResponse.data[1].isFavourite).toBe(true);
        expect(jsonResponse).toEqual({
          success: true,
          data: [
            { _id: "group1", groupname: "Group One", beschreibung: "Test 1", members: [testUserId], isFavourite: true },
            { _id: "group2", groupname: "Group Two", beschreibung: "Test 2", members: [testUserId], isFavourite: true },
          ],
        });
    });

    it("should return 401 if no token is provided", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Nicht authentifiziert", status: 401 });
      const request = new MockHttpRequest();
      const response = await GET(request as unknown as NextRequest);

      expect(response.status).toBe(401);
      expect(mockJsonResponse).toHaveBeenCalledWith({ success: false, error: "Nicht authentifiziert" }, { status: 401 });
    });
      
    it("should return 403 if token is invalid", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Ungültiges Token", status: 403 });
      const request = new MockHttpRequest();
      const response = await GET(request as unknown as NextRequest);

      expect(response.status).toBe(403);
      expect(mockJsonResponse).toHaveBeenCalledWith({ success: false, error: "Ungültiges Token" }, { status: 403 });
    });

    it("should return an error if database query fails", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ id: testUserId, error: null });
      (User.findById as jest.Mock).mockResolvedValue({ favouriteGroups: [] });
      (Group.find as jest.Mock).mockRejectedValue(new Error("Database error"));

      const request = new MockHttpRequest();
      const response = await GET(request as unknown as NextRequest);

      expect(response.status).toBe(500);
      expect(mockJsonResponse).toHaveBeenCalledWith({ success: false, error: "Database error" }, { status: 500 });
    });

  });

  describe("POST /api/groups", () => {
    it("should create a new group successfully", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ id: testUserId, error: null });

      (Group.prototype.save as jest.Mock).mockResolvedValue({
        _id: testGroupId,
        groupname: "New Group",
        beschreibung: "A test group",
        creator: testUserId,
        admins: [testUserId],
        members: [testUserId],
      });

      const requestBody = { groupname: "New Group", beschreibung: "A test group" };
      const request = new MockHttpRequest(requestBody);
      const response = await POST(request as unknown as NextRequest);
      const jsonResponse = await response.json();
      expect(response.status).toBe(201);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data.groupname).toBe("New Group");
      expect(jsonResponse).toEqual({
        success: true,
        data: {
          _id: testGroupId,
          groupname: "New Group",
          beschreibung: "A test group",
          creator: testUserId,
          admins: [testUserId],
          members: [testUserId],
        },
      });
    });

    it("should return a 400 error if groupname is missing", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ id: testUserId, error: null });

      const requestBody = { beschreibung: "Missing name" };
      const request = new MockHttpRequest(requestBody);
      const response = await POST(request as unknown as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Groupname ist erforderlich.");
    });

    it("should return a 401 error if no token is provided", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Nicht authentifiziert", status: 401 });

      const requestBody = { groupname: "Test Group", beschreibung: "Description" };
      const request = new MockHttpRequest(requestBody);
      const response = await POST(request as unknown as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(401);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Nicht authentifiziert");
    });

    it("should return a 403 error if token is invalid", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Ungültiges Token", status: 403 });

      const requestBody = { groupname: "New Group", beschreibung: "A test group" };
      const request = new MockHttpRequest(requestBody);
      const response = await POST(request as unknown as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(403);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Ungültiges Token");
    });

    it("should return a 500 error if database operation fails", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });
      (Group.prototype.save as jest.Mock).mockRejectedValue(new Error("Database error"));

      const requestBody = { groupname: "New Group", beschreibung: "A test group" };
      const request = new MockHttpRequest(requestBody);
      const response = await POST(request as unknown as NextRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Database error");
    });
  });
});
*/