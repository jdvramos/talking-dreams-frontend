import { Grid, Stack, styled, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";
import ChatInfo from "./ChatInfo";
import AddFriendDialog from "./AddFriendDialog";
import FriendRequestSentSnackbar from "./FriendRequestSentSnackbar";
import InvalidImageSnackbar from "./InvalidImageSnackbar";
import ChatInfoDrawerMdOnly from "./ChatInfoDrawerMdOnly";
import ChatInfoDrawerMdBelow from "./ChatInfoDrawerMdBelow";
import ViewFriendsDialog from "./ViewFriendsDialog";
import ViewProfileDialog from "./ViewProfileDialog";
import FriendRequestAcceptedSnackbar from "./FriendRequestAcceptedSnackbar";
import FriendRequestReceivedSnackbar from "./FriendRequestReceivedSnackbar";
import NewMessageReceivedSnackbar from "./NewMessageReceivedSnackbar";
import useSound from "use-sound";
import newMessage from "../sounds/newMessage.mp3";
import { useNavigate, useLocation } from "react-router-dom";
import {
    getUserInfo,
    getUserProfileImage,
    logoutUser,
    uploadImageToCloudinary,
    accessPersistRoute,
} from "../features/authSlice";
import {
    getChatList,
    setChatList,
    getCurrentFriend,
    setCurrentFriend,
    getCurrentMessages,
    setCurrentMessages,
    getOnlineFriends,
    setOnlineFriends,
    getCurrentFriendIsTypingInfo,
    setCurrentFriendIsTypingInfo,
    getMessageSent,
    setMessageSentToTrue,
    setMessageSentToFalse,
    getSocketMessage,
    setSocketMessage,
    getFriendRequestSent,
    setFriendRequestSent,
    appendNewFriendRequestSent,
    removeFriendRequestSent,
    getFriendRequestReceived,
    setFriendRequestReceived,
    appendNewFriendRequestReceived,
    removeFriendRequestReceived,
    getPreferredTheme,
    setPreferredTheme,
    insertSocketMessageToCurrentMessages,
    updateLatestMessageOnChatList,
    updateLatestMessageStatusOnChatList,
    updateLastMessageToSeenOnCurrentMessages,
} from "../features/messengerSlice";
import { resetAllState } from "../features/resetAllState";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";

const MessengerContainer = styled(Stack)(({ theme }) => ({
    height: "100%",
    // backgroundColor and color for dark mode / light mode switch
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
}));

const ChatBoxGridItem = styled(Grid)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
}));

const ChatInfoGridItem = styled(Grid)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "20px",
    height: "100%",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    borderLeftWidth: "thin",
}));

const Messenger = () => {
    const GET_CHATLIST_URL = "/api/v1/messenger/get-chatlist";
    const GET_CURRENT_MESSAGES_URL = "/api/v1/messenger/get-current-messages";
    const SEND_MESSAGE_URL = "/api/v1/messenger/send-message";
    const UPDATE_TO_SEEN_URL = "/api/v1/messenger/update-to-seen";
    const GET_FRIEND_REQUEST_SENT_URL = "/api/v1/messenger/get-fr-sent";
    const GET_FRIEND_REQUEST_RECEIVED_URL = "/api/v1/messenger/get-fr-received";
    const SEND_FRIEND_REQUEST_URL = "/api/v1/messenger/send-fr";
    const CANCEL_SENT_FRIEND_REQUEST_URL = "/api/v1/messenger/cancel-fr";
    const DECLINE_RECEIVED_FRIEND_REQUEST_URL = "/api/v1/messenger/decline-fr";
    const ACCEPT_FRIEND_REQUEST_URL = "/api/v1/messenger/accept-fr";
    const UPDATE_ALL_FRIEND_REQUESTS_TO_SEEN =
        "/api/v1/messenger/update-all-fr-to-seen";
    const GET_PREFERRED_THEME_URL = "/api/v1/messenger/get-theme";
    const SET_PREFERRED_THEME_URL = "/api/v1/messenger/set-theme";

    const scrollRef = useRef();
    const socket = useRef();

    const axiosPrivate = useAxiosPrivate();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const userInfo = useSelector(getUserInfo);
    const userProfileImage = useSelector(getUserProfileImage);

    const chatList = useSelector(getChatList);
    const currentFriend = useSelector(getCurrentFriend);
    const currentMessages = useSelector(getCurrentMessages);
    const onlineFriends = useSelector(getOnlineFriends);
    const currentFriendIsTypingInfo = useSelector(getCurrentFriendIsTypingInfo);
    const messageSent = useSelector(getMessageSent);
    const socketMessage = useSelector(getSocketMessage);
    const friendRequestSent = useSelector(getFriendRequestSent);
    const friendRequestReceived = useSelector(getFriendRequestReceived);
    const preferredTheme = useSelector(getPreferredTheme);

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const location = useLocation();
    const isNewlyRegistered =
        location.state && location.state.isNewlyRegistered;

    const mdBelow = useMediaQuery(theme.breakpoints.down("md"));
    const lgAbove = useMediaQuery(theme.breakpoints.up("lg"));
    const xlAbove = useMediaQuery(theme.breakpoints.up("xl"));
    const mdOnly = useMediaQuery(theme.breakpoints.only("md"));
    const smBelow = useMediaQuery(theme.breakpoints.down("sm"));

    const [showChatList, setShowChatList] = useState(true);

    const [sortedChatList, setSortedChatList] = useState(null);

    const [message, setMessage] = useState("");

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validImage, setValidImage] = useState(false);
    const [showUploadError, setShowUploadError] = useState(false);

    const [friendIsTyping, setFriendIsTyping] = useState(null);

    const [isInitialMount, setIsInitialMount] = useState(true);
    const [isInitialMount2, setIsInitialMount2] = useState(true);

    const [newUsersList, setNewUsersList] = useState([]);

    const [filterChatList, setFilterChatList] = useState("");

    const [chatListLoading, setChatListLoading] = useState(false);
    const [currentMessagesLoading, setCurrentMessagesLoading] = useState(false);

    const [getOnlineUsersAgain, setGetOnlineUsersAgain] = useState(false);

    const [newMessageReceivedSound] = useSound(newMessage);

    const [chatInfoState, setChatInfoState] = useState({
        chatInfoOpen: false,
        chatInfoDrawerOpen: false,
    });

    const [showNewFriendAlert, setShowNewFriendAlert] = useState({
        showAlert: false,
        newFriendName: "",
    });

    const [showFriendRequestSentAlert, setShowFriendRequestSentAlert] =
        useState(false);

    const [showFriendRequestReceivedAlert, setShowFriendRequestReceivedAlert] =
        useState({
            showAlert: false,
            senderName: "",
        });

    const [showNewMessageReceivedAlert, setShowNewMessageReceivedAlert] =
        useState({
            showAlert: false,
            senderName: "",
        });

    const [hasUnopenedFriendRequest, setHasUnopenedFriendRequest] =
        useState(false);

    const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
    const [viewFriendsDialogOpen, setViewFriendsDialogOpen] = useState(false);
    const [viewProfileDialogOpen, setViewProfileDialogOpen] = useState(false);

    const updateAllFriendRequestsReceivedToSeen = async () => {
        try {
            await axiosPrivate.patch(UPDATE_ALL_FRIEND_REQUESTS_TO_SEEN);

            dispatchSetFriendRequestReceived();
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    useEffect(() => {
        if (viewFriendsDialogOpen) {
            setIsInitialMount2(false);
        }
    }, [viewFriendsDialogOpen]);

    useEffect(() => {
        if (!isInitialMount2 && !viewFriendsDialogOpen) {
            updateAllFriendRequestsReceivedToSeen();
        }
    }, [isInitialMount2, viewFriendsDialogOpen]);

    useEffect(() => {
        const turnOnBlueDot =
            friendRequestReceived.length > 0 &&
            friendRequestReceived.some((fr) => !fr.requestSeen);
        setHasUnopenedFriendRequest(turnOnBlueDot);
    }, [friendRequestReceived]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            setValidImage(false);
            setShowUploadError(true);
            return;
        }

        setImage(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImagePreview(reader.result);
        };

        setValidImage(true);
    };

    const handleDeleteImagePreview = () => {
        setImage(null);
        setImagePreview(null);
        setValidImage(false);
        setShowUploadError(false);
    };

    const changeInfoState = () => {
        setChatInfoState({
            chatInfoOpen: true,
            chatInfoDrawerOpen: false,
        });
        setIsInitialMount(false);
    };

    useEffect(() => {
        if (isInitialMount && currentFriend) {
            changeInfoState();
        }
    }, [isInitialMount, currentFriend]);

    const compareDates = (a, b) => {
        const dateA = a.latestMessage
            ? a.latestMessage.created_at
            : a.friendshipTimestamp;
        const dateB = b.latestMessage
            ? b.latestMessage.created_at
            : b.friendshipTimestamp;

        return new Date(dateB) - new Date(dateA);
    };

    useEffect(() => {
        if (chatList) {
            const chatListCopy = [...chatList];
            const sortedChatList = chatListCopy
                .sort(compareDates)
                .filter((chat) => {
                    const fullName = `${chat.friendInfo.firstName} ${chat.friendInfo.lastName}`;
                    return fullName
                        .toLowerCase()
                        .includes(filterChatList.toLowerCase());
                });
            setSortedChatList(sortedChatList);
        }
    }, [chatList, filterChatList]);

    useEffect(() => {
        const getPreferredTheme = async () => {
            const storedTheme = localStorage.getItem("preferredTheme");

            if (storedTheme) {
                dispatch(setPreferredTheme({ preferredTheme: storedTheme }));
            } else {
                try {
                    const response = await axiosPrivate.get(
                        GET_PREFERRED_THEME_URL
                    );

                    const apiPreferredTheme = response.data.preferredTheme;
                    dispatch(
                        setPreferredTheme({ preferredTheme: apiPreferredTheme })
                    );
                    localStorage.setItem("preferredTheme", apiPreferredTheme);
                } catch (error) {
                    await dispatch(logoutUser());
                    dispatch(resetAllState());
                    navigate("/login");
                }
            }
        };

        getPreferredTheme();
    }, []);

    const dispatchSetPreferredTheme = async (theme) => {
        try {
            await axiosPrivate.patch(
                SET_PREFERRED_THEME_URL,
                JSON.stringify({ preferredTheme: theme })
            );
            dispatch(setPreferredTheme({ preferredTheme: theme }));
            localStorage.setItem("preferredTheme", theme);
        } catch (err) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    useEffect(() => {
        socket.current = io("ws://talking-dreams-socket.onrender.com/");
        // socket.current = io("ws://localhost:8001");
        // socket.current = io("ws://192.168.1.4:8001");

        socket.current.on("receiveMessage", (message) => {
            dispatch(setSocketMessage({ socketMessage: message }));
        });

        socket.current.on("friendIsTypingResponse", (typingInfo) => {
            setFriendIsTyping(typingInfo);
        });

        socket.current.on(
            "messageSeenByFriendResponse",
            (seenSocketMessage) => {
                dispatch(
                    updateLatestMessageStatusOnChatList({
                        latestMessage: seenSocketMessage,
                    })
                );

                dispatch(updateLastMessageToSeenOnCurrentMessages());
            }
        );

        socket.current.on("getAllOnlineUsers", (onlineUsers) => {
            const onlineFriendsList = onlineUsers
                .filter((user) => user.userInfo._id !== userInfo?.id)
                .filter((user) =>
                    user.userInfo.friends
                        .map((friend) => friend.friendId)
                        .includes(userInfo?.id)
                )
                .map((user) => user.userInfo.id);

            if (getOnlineUsersAgain) {
                setGetOnlineUsersAgain(false);
            }

            dispatch(setOnlineFriends({ onlineFriends: onlineFriendsList }));
        });

        socket.current.on(
            "friendRequestReceived",
            (senderData, senderFullName) => {
                dispatch(appendNewFriendRequestReceived({ data: senderData }));
                setShowFriendRequestReceivedAlert({
                    showAlert: true,
                    senderName: senderFullName,
                });
            }
        );

        socket.current.on("cancelFriendRequestResponse", (senderId) => {
            dispatch(removeFriendRequestReceived({ senderId }));
        });

        socket.current.on("declineFriendRequestResponse", (receiverId) => {
            dispatch(removeFriendRequestSent({ receiverId }));
        });

        socket.current.on(
            "acceptFriendRequestResponse",
            async (receiverId, receiverFullName) => {
                dispatch(removeFriendRequestSent({ receiverId }));

                setGetOnlineUsersAgain(true);

                // Since a new friend was added, we need to re-run the persist route to get the updated userInfo since we need an updated userInfo.friends, there's a useEffect somewhere that gets all online users again when userInfo.friends changes.
                await dispatch(accessPersistRoute()).unwrap();

                setShowNewFriendAlert({
                    showAlert: true,
                    newFriendName: receiverFullName,
                });

                await dispatchSetChatList();
            }
        );

        socket.current.on("newUserRegisteredResponse", (userInfo) => {
            setNewUsersList((prev) => [...prev, userInfo]);
        });
    }, []);

    useEffect(() => {
        if (isNewlyRegistered) {
            socket.current.emit("newUserRegistered", userInfo);
        }
    }, [isNewlyRegistered]);

    useEffect(() => {
        if (getOnlineUsersAgain) {
            socket.current.emit(
                "getOnlineUsersAgain",
                userInfo?.id,
                userInfo?.friends
            );
        }
    }, [userInfo.friends]);

    useEffect(() => {
        if (friendIsTyping && friendIsTyping.senderId === currentFriend?._id) {
            dispatch(
                setCurrentFriendIsTypingInfo({ typingInfo: friendIsTyping })
            );
        }
    }, [friendIsTyping]);

    useEffect(() => {
        socket.current.emit("addUser", userInfo.id, userInfo);
    }, []);

    const handleSelectCurrentFriend = (friendInfo) => {
        dispatch(setCurrentFriend({ currentFriend: friendInfo }));

        if (mdBelow) {
            setShowChatList(false);
        }
    };

    const dispatchSetChatList = async () => {
        try {
            setChatListLoading(true);
            const response = await axiosPrivate.get(GET_CHATLIST_URL);
            dispatch(setChatList({ chatList: response.data.chatList }));
        } catch (err) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        } finally {
            setChatListLoading(false);
        }
    };

    useEffect(() => {
        dispatchSetChatList();
    }, []);

    const dispatchSetCurrentMessages = async (friendId) => {
        try {
            const response = await axiosPrivate.get(
                `${GET_CURRENT_MESSAGES_URL}/${friendId}`
            );
            dispatch(
                setCurrentMessages({
                    currentMessages: response.data.currentMessages,
                })
            );
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        } finally {
            setCurrentMessagesLoading(false);
        }
    };

    useEffect(() => {
        if (currentFriend) {
            setCurrentMessagesLoading(true);
            dispatchSetCurrentMessages(currentFriend?._id);
        }
    }, [currentFriend]);

    const sendMessage = async () => {
        try {
            const senderName = `${userInfo?.firstName} ${userInfo?.lastName}`;
            const response = await axiosPrivate.post(
                SEND_MESSAGE_URL,
                JSON.stringify({
                    messageType: "text",
                    content: message || "👍",
                    senderId: userInfo?.id,
                    senderName,
                    receiverId: currentFriend?._id,
                })
            );

            dispatch(
                setMessageSentToTrue({ messageSent: response.data.messageSent })
            );

            setMessage("");
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    const sendImage = async () => {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", "dkkcgnkep");

        try {
            const imageSent = await dispatch(
                uploadImageToCloudinary({ data })
            ).unwrap();

            const senderName = `${userInfo?.firstName} ${userInfo?.lastName}`;

            const response = await axiosPrivate.post(
                SEND_MESSAGE_URL,
                JSON.stringify({
                    messageType: "image",
                    content: imageSent,
                    senderId: userInfo?.id,
                    senderName,
                    receiverId: currentFriend?._id,
                })
            );

            dispatch(
                setMessageSentToTrue({ messageSent: response.data.messageSent })
            );

            setImage(null);
            setImagePreview(null);
            setValidImage(false);
            setShowUploadError(false);
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    const updateMessageStatusToSeen = async (socketMessage) => {
        try {
            await axiosPrivate.patch(
                UPDATE_TO_SEEN_URL,
                JSON.stringify({ message: socketMessage })
            );
        } catch {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    useEffect(() => {
        if (
            currentFriend &&
            currentMessages.length > 0 &&
            currentMessages[currentMessages.length - 1].senderId ===
                currentFriend?._id &&
            currentMessages[currentMessages.length - 1].status !== "seen"
        ) {
            const lastMessageOnCurrentMessages =
                currentMessages[currentMessages.length - 1];

            updateMessageStatusToSeen(lastMessageOnCurrentMessages);

            const updatedToSeen = {
                ...lastMessageOnCurrentMessages,
                status: "seen",
            };

            dispatch(
                updateLatestMessageStatusOnChatList({
                    latestMessage: updatedToSeen,
                })
            );

            dispatch(updateLastMessageToSeenOnCurrentMessages());

            socket.current.emit("messageSeenByFriend", updatedToSeen);
        }
    }, [currentMessages]);

    useEffect(() => {
        if (messageSent) {
            socket.current.emit(
                "sendMessage",
                currentMessages[currentMessages.length - 1]
            );

            dispatch(
                updateLatestMessageOnChatList({
                    latestMessage: currentMessages[currentMessages.length - 1],
                })
            );

            dispatch(setMessageSentToFalse());
        }
    }, [messageSent]);

    useEffect(() => {
        if (
            socketMessage &&
            currentFriend &&
            socketMessage.senderId === currentFriend?._id &&
            socketMessage.receiverId === userInfo?.id
        ) {
            dispatch(insertSocketMessageToCurrentMessages({ socketMessage }));

            // Async call
            updateMessageStatusToSeen(socketMessage);

            const seenSocketMessage = {
                ...socketMessage,
                status: "seen",
            };

            socket.current.emit("messageSeenByFriend", seenSocketMessage);

            dispatch(
                updateLatestMessageStatusOnChatList({
                    latestMessage: seenSocketMessage,
                })
            );

            dispatch(setSocketMessage({ socketMessage: "" }));
        }
    }, [socketMessage]);

    useEffect(() => {
        if (
            socketMessage &&
            socketMessage.senderId !== currentFriend?._id &&
            socketMessage.receiverId === userInfo?.id
        ) {
            // Add an alert when new message comes or notification sound
            newMessageReceivedSound();

            setShowNewMessageReceivedAlert({
                showAlert: true,
                senderName: socketMessage.senderName,
            });

            dispatch(
                updateLatestMessageStatusOnChatList({
                    latestMessage: socketMessage,
                })
            );
        }
    }, [socketMessage]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView();
    }, [currentMessages, currentFriendIsTypingInfo]);

    useEffect(() => {
        setChatInfoState((prev) => ({
            chatInfoOpen: prev.chatInfoOpen,
            chatInfoDrawerOpen: false,
        }));
    }, [lgAbove]);

    const goBackToChatList = () => {
        setShowChatList(true);
        dispatch(setCurrentFriend({ currentFriend: null }));
        dispatch(
            setCurrentMessages({
                currentMessages: [],
            })
        );
    };

    useEffect(() => {
        if (currentFriend) {
            setMessage("");
        }

        if (currentFriend === null) {
            setChatInfoState({
                chatInfoOpen: false,
                chatInfoDrawerOpen: false,
            });
        }
    }, [currentFriend]);

    useEffect(() => {
        if (!showChatList && !mdBelow) {
            setShowChatList(true);
        }

        if (currentFriend && mdBelow) {
            dispatch(setCurrentFriend({ currentFriend: null }));
            dispatch(
                setCurrentMessages({
                    currentMessages: [],
                })
            );
        }
    }, [mdBelow]);

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const addEmoji = (emoji) => {
        setMessage(`${message}` + emoji);
    };

    useEffect(() => {
        if (message) {
            socket.current.emit("friendIsTyping", {
                senderId: userInfo?.id,
                receiverId: currentFriend?._id,
            });
        }
    }, [message]);

    const dispatchSetFriendRequestSent = async () => {
        try {
            const response = await axiosPrivate.get(
                GET_FRIEND_REQUEST_SENT_URL
            );
            dispatch(
                setFriendRequestSent({
                    friendRequestSent: response.data.friendRequestSent,
                })
            );
        } catch (err) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    useEffect(() => {
        dispatchSetFriendRequestSent();
    }, []);

    const dispatchSetFriendRequestReceived = async () => {
        try {
            const response = await axiosPrivate.get(
                GET_FRIEND_REQUEST_RECEIVED_URL
            );
            dispatch(
                setFriendRequestReceived({
                    friendRequestReceived: response.data.friendRequestReceived,
                })
            );
        } catch (err) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    useEffect(() => {
        dispatchSetFriendRequestReceived();
    }, []);

    const sendFriendRequest = async (chosenUser) => {
        try {
            const response = await axiosPrivate.post(
                SEND_FRIEND_REQUEST_URL,
                JSON.stringify({
                    receiverId: chosenUser._id,
                })
            );

            const senderData = response.data.sender;
            const receiverId = response.data.receiver.userData._id;

            const senderFullName = `${userInfo?.firstName} ${userInfo?.lastName}`;

            // emit an event
            socket.current.emit(
                "sendFriendRequest",
                senderData,
                receiverId,
                senderFullName
            );

            // if success push the new request to friendRequestSent
            dispatch(
                appendNewFriendRequestSent({ data: response.data.receiver })
            );
        } catch (err) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    const cancelFriendRequest = async (receiverOfRequestId) => {
        try {
            const response = await axiosPrivate.patch(
                CANCEL_SENT_FRIEND_REQUEST_URL,
                JSON.stringify({
                    receiverOfRequestId,
                })
            );

            const senderId = userInfo?.id;

            dispatch(
                removeFriendRequestSent({ receiverId: receiverOfRequestId })
            );

            socket.current.emit(
                "cancelFriendRequest",
                senderId,
                receiverOfRequestId
            );
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    const declineFriendRequest = async (senderOfRequestId) => {
        try {
            const response = await axiosPrivate.patch(
                DECLINE_RECEIVED_FRIEND_REQUEST_URL,
                JSON.stringify({
                    senderOfRequestId,
                })
            );

            const receiverId = userInfo?.id;

            dispatch(
                removeFriendRequestReceived({ senderId: senderOfRequestId })
            );

            socket.current.emit(
                "declineFriendRequest",
                receiverId,
                senderOfRequestId
            );
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    const acceptFriendRequest = async (senderOfRequestId) => {
        try {
            const response = await axiosPrivate.post(
                ACCEPT_FRIEND_REQUEST_URL,
                JSON.stringify({
                    senderOfRequestId,
                })
            );

            const receiverId = userInfo?.id;

            const receiverFullName = `${userInfo?.firstName} ${userInfo?.lastName}`;

            dispatch(
                removeFriendRequestReceived({ senderId: senderOfRequestId })
            );

            setGetOnlineUsersAgain(true);

            // Since a new friend was added, we need to re-run the persist route to get the updated userInfo since we need an updated userInfo.friends, there's a useEffect somewhere that gets all online users again when userInfo.friends changes.
            await dispatch(accessPersistRoute()).unwrap();

            await dispatchSetChatList();

            socket.current.emit(
                "acceptFriendRequest",
                receiverId,
                receiverFullName,
                senderOfRequestId
            );
        } catch (error) {
            await dispatch(logoutUser());
            dispatch(resetAllState());
            navigate("/login");
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem("preferredTheme");
        await dispatch(logoutUser());
        socket.current.emit("logout", userInfo.id);
        dispatch(resetAllState());
        navigate("/login");
    };

    return (
        <MessengerContainer direction="row">
            <Sidebar
                userInfo={userInfo}
                userProfileImage={userProfileImage}
                mdBelow={mdBelow}
                handleLogout={handleLogout}
                setViewFriendsDialogOpen={setViewFriendsDialogOpen}
                hasUnopenedFriendRequest={hasUnopenedFriendRequest}
                updateAllFriendRequestsReceivedToSeen={
                    updateAllFriendRequestsReceivedToSeen
                }
                setViewProfileDialogOpen={setViewProfileDialogOpen}
            />
            <ChatList
                userId={userInfo.id}
                chatList={chatList}
                sortedChatList={sortedChatList}
                handleSelectCurrentFriend={handleSelectCurrentFriend}
                preferredTheme={preferredTheme}
                dispatchSetPreferredTheme={dispatchSetPreferredTheme}
                isDarkMode={isDarkMode}
                smBelow={smBelow}
                mdBelow={mdBelow}
                showChatList={showChatList}
                currentFriend={currentFriend}
                onlineFriends={onlineFriends}
                handleLogout={handleLogout}
                setAddFriendDialogOpen={setAddFriendDialogOpen}
                setViewFriendsDialogOpen={setViewFriendsDialogOpen}
                hasUnopenedFriendRequest={hasUnopenedFriendRequest}
                updateAllFriendRequestsReceivedToSeen={
                    updateAllFriendRequestsReceivedToSeen
                }
                setFilterChatList={setFilterChatList}
                chatListLoading={chatListLoading}
            />
            <Grid
                display={showChatList && mdBelow ? "none" : "flex"}
                flex={1}
                container
                height="100%"
            >
                <ChatBoxGridItem
                    item
                    xs={12} // <- includes sm
                    md={12}
                    lg={chatInfoState.chatInfoOpen && lgAbove ? 8 : 12}
                >
                    <ChatBox
                        currentFriend={currentFriend}
                        currentMessages={currentMessages}
                        mdBelow={mdBelow}
                        isDarkMode={isDarkMode}
                        goBackToChatList={goBackToChatList}
                        userId={userInfo.id}
                        handleMessageChange={handleMessageChange}
                        message={message}
                        addEmoji={addEmoji}
                        sendMessage={sendMessage}
                        onlineFriends={onlineFriends}
                        setChatInfoState={setChatInfoState}
                        scrollRef={scrollRef}
                        currentFriendIsTypingInfo={currentFriendIsTypingInfo}
                        handleImageChange={handleImageChange}
                        imagePreview={imagePreview}
                        validImage={validImage}
                        handleDeleteImagePreview={handleDeleteImagePreview}
                        sendImage={sendImage}
                        currentMessagesLoading={currentMessagesLoading}
                    />
                </ChatBoxGridItem>
                {chatInfoState.chatInfoOpen && lgAbove && (
                    <ChatInfoGridItem item lg={4}>
                        <ChatInfo
                            currentFriend={currentFriend}
                            currentMessages={currentMessages}
                            isDarkMode={isDarkMode}
                            xlAbove={xlAbove}
                        />
                    </ChatInfoGridItem>
                )}
                {chatInfoState.chatInfoDrawerOpen && mdOnly && (
                    <ChatInfoDrawerMdOnly
                        currentFriend={currentFriend}
                        currentMessages={currentMessages}
                        isDarkMode={isDarkMode}
                        xlAbove={xlAbove}
                        chatInfoState={chatInfoState}
                    />
                )}
                {chatInfoState.chatInfoDrawerOpen && mdBelow && (
                    <ChatInfoDrawerMdBelow
                        currentFriend={currentFriend}
                        currentMessages={currentMessages}
                        isDarkMode={isDarkMode}
                        xlAbove={xlAbove}
                        chatInfoState={chatInfoState}
                    />
                )}
            </Grid>
            {/* modals and alerts */}
            <AddFriendDialog
                addFriendDialogOpen={addFriendDialogOpen}
                setAddFriendDialogOpen={setAddFriendDialogOpen}
                isDarkMode={isDarkMode}
                sendFriendRequest={sendFriendRequest}
                friends={userInfo?.friends}
                friendRequestSent={friendRequestSent}
                friendRequestReceived={friendRequestReceived}
                newUsersList={newUsersList}
                setShowFriendRequestSentAlert={setShowFriendRequestSentAlert}
            />
            <ViewFriendsDialog
                friendRequestSent={friendRequestSent}
                friendRequestReceived={friendRequestReceived}
                viewFriendsDialogOpen={viewFriendsDialogOpen}
                setViewFriendsDialogOpen={setViewFriendsDialogOpen}
                isDarkMode={isDarkMode}
                cancelFriendRequest={cancelFriendRequest}
                declineFriendRequest={declineFriendRequest}
                acceptFriendRequest={acceptFriendRequest}
                updateAllFriendRequestsReceivedToSeen={
                    updateAllFriendRequestsReceivedToSeen
                }
            />
            <ViewProfileDialog
                userInfo={userInfo}
                userProfileImage={userProfileImage}
                viewProfileDialogOpen={viewProfileDialogOpen}
                setViewProfileDialogOpen={setViewProfileDialogOpen}
            />
            <FriendRequestSentSnackbar
                showFriendRequestSentAlert={showFriendRequestSentAlert}
                setShowFriendRequestSentAlert={setShowFriendRequestSentAlert}
                isDarkMode={isDarkMode}
                smBelow={smBelow}
            />
            <FriendRequestReceivedSnackbar
                showFriendRequestReceivedAlert={showFriendRequestReceivedAlert}
                setShowFriendRequestReceivedAlert={
                    setShowFriendRequestReceivedAlert
                }
                isDarkMode={isDarkMode}
                mdBelow={mdBelow}
            />
            <FriendRequestAcceptedSnackbar
                showNewFriendAlert={showNewFriendAlert}
                setShowNewFriendAlert={setShowNewFriendAlert}
                isDarkMode={isDarkMode}
                mdBelow={mdBelow}
            />
            <NewMessageReceivedSnackbar
                showNewMessageReceivedAlert={showNewMessageReceivedAlert}
                setShowNewMessageReceivedAlert={setShowNewMessageReceivedAlert}
                isDarkMode={isDarkMode}
                mdBelow={mdBelow}
            />
            <InvalidImageSnackbar
                showUploadError={showUploadError}
                setShowUploadError={setShowUploadError}
            />
        </MessengerContainer>
    );
};

export default Messenger;
