import User from "../models/User.js";

/*USER READ CONTROLLERS*/

//Get user data
export const getUser = async (req, res) => {
    try {
        const {id} = req.params
        const user = await User.findById(id)
        res.status(200).json(user)
    } catch (err) {
        res.status(404).json({message: err.message})
    }
}

//Edit User Profile

export const editUser  = async (req, res) => {
    try{
        const {id} = req.params;
        const {firstName, lastName, location, occupation} = req.body

        const user = await User.findById(id)

        if(!user){
            res.status(404)
            throw new Error("User not found")
        }

        const updatedUser = await User.findByIdAndUpdate(
            {_id: id},
            {
                firstName,
                lastName,
                location,
                occupation,

            },
            {
                new: true,
                runValidators: true
            }
        )

        res.status(200).json(updatedUser);
        
    } catch(err){
        res.status(500).json({error: err.message})
    } 
}

//Get user Friends

export const getUserFriends = async (req, res) => {
    try {
        const {id} = req.params
        const user = await User.findById(id)
        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        )
        const formatFriends = friends.map(
            ({_id, firstName, lastName, occupation, location, picturePath}) => {
                return {_id, firstName, lastName, occupation, location, picturePath}
            }
        )

        res.status(200).json(formatFriends)
    } catch (err) {
        res.status(404).json({message: err.message})
    }
}

/*USER UPDATE CONTROLLER*/

export const addRemoveFriend = async (req, res) => {
    try {
        const {id, friendId} = req.params
        const user = await User.findById(id);
        const friend = await User.findById(friendId)

        if(user.friends.includes(friendId)) {
            user.friends = user.friends.filter((id) => id !== friendId)
            friend.friends = friend.friends.filter((id) => id!== id)
        } else {
            user.friends.push(friendId);
            friend.friends.push(id)
        }

        await user.save()
        await friend.save()

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        )
        const formatFriends = friends.map(
            ({_id, firstName, lastName, occupation, location, picturePath}) => {
                return {_id, firstName, lastName, occupation, location, picturePath}
            }
        )

        res.status(200).json(formatFriends)
        
    } catch (err) {
        res.status(404).json({message: err.message})
    }
}