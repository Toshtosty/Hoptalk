import User from '../models/user.js';
import FriendRequest from '../models/FriendRequest.js'; 


// export async function getRecommendedUsers(req, res) {


//   try {
//     const cuurentUserId = req.user.id;
//      const currentUser = req.user;

//      const getRecommendedUsers=await User.find({
//         $and:[
//             { _id: { $ne: cuurentUserId } }, // Exclude current user
//             { _id: { $nin: currentUser.friends } }, // Exclude friends
//             {isOnboarded: true} // Only include users who are onboarded
//         ]
//      })
//      res.status(200).json(getRecommendedUsers);
//   } catch (error) {
//     console.error('Error fetching recommended users:', error.message);
//     res.status(500).json({ message: 'internal server error' });
//   }
// }

import mongoose from 'mongoose';

export async function getRecommendedUsers(req, res) {
  try {
    const currentUser = await User.findById(req.user.id).select("friends");

    const excludedIds = [req.user.id, ...(currentUser.friends || [])];

    const recommendedUsers = await User.find({
      _id: { $nin: excludedIds },
      isOnboarded: true,
    }).select("fullName profilePic nativeLanguage learningLanguage bio location");

    console.log("Found users:", recommendedUsers.length);
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error('Error fetching recommended users:', error.message);
    res.status(500).json({ message: 'internal server error' });
  }
}


export async function getMyFriends(req, res) {
  try {
   
    const user= await User.findById(req.user.id).select('friends')
    .populate('friends',"fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);


  } catch (error) {
    console.error('Error fetching friends:', error.message);
    // Handle the error appropriately, e.g., send a response with an error message
    res.status(500).json({ message: 'Error fetching friends' });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId= req.user.id;
    const { id: recipientId } = req.params; // ✅ correct way to destructure route param

    //prevent sending friend request to self

    if(myId === recipientId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }
    //check if the friend request already exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }
    //check if the recipient is already a friend
    if( recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user." });
    }
    //check if a friend request already exists
    const existingRequest = await FriendRequest.findOne({   
        $or: [
            { sender: myId, recipient: recipientId },
            { sender: recipientId, recipient: myId }
        ]
        });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists." });
    }       

    //create a new friend request
    const newFriendRequest = await FriendRequest.create({
        sender: myId,
        recipient: recipientId
        });

        res.status(201).json({ FriendRequest});



}catch (error) {
    console.error('Error sending friend request:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }

}                      

export async function acceptFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: requestId } = req.params;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Check if the current user is the recipient of the request
    if (friendRequest.recipient.toString() !== myId) {
      return res.status(403).json({ message: "You are not authorized to accept this friend request." });
    }

    // Update the status of the friend request to 'accepted'
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add each user to the other's friends list
    //$addToSet ensures no duplicates
   await User.findByIdAndUpdate(
      friendRequest.sender,
      { $addToSet: { friends: friendRequest.recipient} }, // Add current user to
    );

    await User.findByIdAndUpdate(
      friendRequest.recipient,
      { $addToSet: { friends: friendRequest.sender} }, // Add current user to
    );

    res.status(200).json({ message: "Friend request accepted successfully." });

  } catch (error) {
    console.error('Error accepting friend request:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}


export async function getFriendRequests(req, res) {
try{
    const incomingReqs = await FriendRequest.find({ 
        recipient: req.user.id, 
        status: 'pending' })
      .populate('sender', 'fullName profilePic nativeLanguage learningLanguage');
        
        const acceptedReqs = await FriendRequest.find({
        recipient: req.user.id, 
        status: 'accepted' })
      .populate('recipient', 'fullName profilePic ');

    res.status(200).json({ incomingReqs, acceptedReqs });
}
catch(error) {
    console.error('Error fetching friend requests:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getOutgoingFriendRequests(req, res) {
    try{
        const outgoingRequests = await FriendRequest.find({ 
            sender: req.user.id, 
            status: 'pending' })
          .populate('recipient', 'fullName profilePic nativelanguage learningLanguage');
        
        res.status(200).json(outgoingRequests);
    }
    catch(error) {
        console.error('Error fetching outgoing friend requests:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}