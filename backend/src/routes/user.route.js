import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
     getRecommendedUsers,
      getMyFriends , 
      sendFriendRequest,
      acceptFriendRequest,
      getFriendRequests
, getOutgoingFriendRequests
} from '../controllers/user.controller.js';
import { get } from 'mongoose';


const router = express.Router();
//apply auth middleware to all routes in this file
router.use(protectRoute);

router.get('/', getRecommendedUsers);

router.get('/friends', getMyFriends);
//send a friend request
router.post('/friend-request/:id',sendFriendRequest);
//accept a friend request
router.put('/friend-request/:id/accept',acceptFriendRequest);

router.get('/friend-requests',getFriendRequests);//for notification page

router.get('/outgoing-friend-requests',getOutgoingFriendRequests);

export default router;