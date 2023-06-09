import {
    Avatar,
    Badge,
    Box,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
    styled,
    useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import FriendOpening from "./FriendOpening";
import FriendOpeningSkeleton from "./FriendOpeningSkeleton";
import Messages from "./Messages";
import MessagesSkeleton from "./MessagesSkeleton";
import { useEffect, useRef, useState } from "react";

const CBHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60px",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    borderBottomWidth: "thin",
}));

const CBFriendInfo = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
}));

const CBMessages = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto",
}));

const CBSender = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 5px",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    borderTopWidth: "thin",
}));

const ChatTextField = styled(TextField)(({ theme }) => ({
    margin: "10px 5px",
    paddingRight: "0",
    "& .MuiInputBase-root": {
        paddingTop: "8px",
        paddingBottom: "8px",
    },
    "& .MuiInputBase-adornedEnd": {
        paddingRight: "0px",
    },
    "& textarea": {
        maxHeight: "80px",
        resize: "none",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
            display: "none",
        },
    },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    borderRadius: "20px",
    backgroundColor: "#fff",
    padding: "8px 12px",
    height: "60px",
    marginLeft: "5px",
    marginRight: "5px",
    marginBottom: "10px",
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
    width: "50px",
    borderRadius: "20px",
    height: "100%",
    position: "relative",
}));

const ImagePreview = styled(Box)(({ theme }) => ({
    width: "50px",
    borderRadius: "20px",
    height: "100%",
    objectFit: "cover",
}));

const RemoveImagePreviewButton = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    top: "-5px",
    right: "-7px",
    padding: "3px",
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: "#44b700",
        color: "#44b700",
        boxShadow: `0 0 0 2px ${theme.palette.background.default}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

const ChatBox = ({
    currentFriend,
    currentMessages,
    mdBelow,
    isDarkMode,
    goBackToChatList,
    userId,
    handleMessageChange,
    message,
    addEmoji,
    sendMessage,
    onlineFriends,
    setChatInfoState,
    scrollRef,
    currentFriendIsTypingInfo,
    handleImageChange,
    imagePreview,
    validImage,
    handleDeleteImagePreview,
    sendImage,
    currentMessagesLoading,
}) => {
    const theme = useTheme();

    const emojis = ["❤️", "😆", "😮", "😢", "😡"];

    const [anchorEl, setAnchorEl] = useState(null);
    const [isFriendOnline, setFriendOnline] = useState(false);

    const chatBoxRef = useRef(null);

    const [chatBoxHeight, setChatBoxHeight] = useState(0);

    const [numOfAllowedSkeletonMessages, setNumOfAllowedSkeletonMessages] =
        useState(0);

    const open = Boolean(anchorEl);

    const imageUploadRef = useRef();

    const handleUploadClick = () => {
        imageUploadRef.current.click();
    };

    const handleOpenEmojiMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseEmojiMenu = () => {
        setAnchorEl(null);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && message) {
            event.preventDefault();
            sendMessage("text");
        }
    };

    useEffect(() => {
        const isOnline =
            onlineFriends &&
            onlineFriends.length > 0 &&
            onlineFriends.includes(currentFriend?._id)
                ? true
                : false;
        setFriendOnline(isOnline);
    }, [onlineFriends, currentFriend]);

    useEffect(() => {
        if (chatBoxRef.current) {
            const height = chatBoxRef.current.offsetHeight;
            setChatBoxHeight(height);
        }
    }, [currentFriend]);

    useEffect(() => {
        const messagesBoxHeight = chatBoxHeight - 248;
        setNumOfAllowedSkeletonMessages(Math.floor(messagesBoxHeight / 81));
    }, [chatBoxHeight, currentFriend]);

    return (
        <>
            {currentFriend ? (
                <>
                    <CBHeader>
                        {mdBelow && (
                            <IconButton
                                onClick={() => goBackToChatList()}
                                aria-label="back"
                                sx={{ color: "#1976d2", marginLeft: 1 }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <CBFriendInfo marginLeft={!mdBelow ? 3 : 1}>
                            {isFriendOnline ? (
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    variant="dot"
                                >
                                    <Avatar
                                        src={currentFriend?.userProfileImage}
                                        alt={`${currentFriend?.firstName} ${currentFriend?.lastName}`}
                                        sx={{ width: "44px", height: "44px" }}
                                    />
                                </StyledBadge>
                            ) : (
                                <Avatar
                                    src={currentFriend?.userProfileImage}
                                    alt={`${currentFriend?.firstName} ${currentFriend?.lastName}`}
                                    sx={{ width: "44px", height: "44px" }}
                                />
                            )}
                            <Stack ml={1}>
                                <Typography
                                    variant="body1"
                                    component="h2"
                                    fontWeight={500}
                                >
                                    {`${currentFriend?.firstName} ${currentFriend?.lastName}`}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    fontSize="0.80rem"
                                    fontWeight={400}
                                    color="text.secondary"
                                >
                                    {isFriendOnline ? "Online" : "Offline"}
                                </Typography>
                            </Stack>
                        </CBFriendInfo>
                        <IconButton
                            aria-label="more info"
                            sx={{ color: "#1976d2", marginRight: 1 }}
                            onClick={() =>
                                setChatInfoState((prev) => ({
                                    chatInfoOpen: !prev.chatInfoOpen,
                                    chatInfoDrawerOpen: true,
                                }))
                            }
                        >
                            <InfoIcon />
                        </IconButton>
                    </CBHeader>
                    <CBMessages
                        ref={chatBoxRef}
                        sx={{
                            "&::-webkit-scrollbar": {
                                width: "6px",
                                backgroundColor:
                                    theme.palette.background.default,
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: isDarkMode
                                    ? "#5e5e5e"
                                    : "#C4C4C4",
                                borderRadius: "3px",
                            },
                        }}
                    >
                        {currentMessagesLoading ? (
                            <>
                                <FriendOpeningSkeleton />
                                <MessagesSkeleton
                                    numOfAllowedSkeletonMessages={
                                        numOfAllowedSkeletonMessages
                                    }
                                />
                            </>
                        ) : (
                            <>
                                <FriendOpening currentFriend={currentFriend} />
                                <Messages
                                    currentMessages={currentMessages}
                                    userId={userId}
                                    currentFriend={currentFriend}
                                    isDarkMode={isDarkMode}
                                    scrollRef={scrollRef}
                                    currentFriendIsTypingInfo={
                                        currentFriendIsTypingInfo
                                    }
                                />
                            </>
                        )}
                    </CBMessages>
                    <CBSender
                        sx={{
                            height:
                                imagePreview && validImage ? "80px" : "auto",
                            alignItems:
                                imagePreview && validImage
                                    ? "flex-end"
                                    : "center",
                        }}
                    >
                        <IconButton
                            component={InputLabel}
                            aria-label="insert image"
                            size="medium"
                            sx={{
                                alignSelf: "flex-end",
                                marginBottom: "10px",
                                color: "#1976d2",
                            }}
                            htmlFor="uploadImage"
                            onClick={handleUploadClick}
                        >
                            <ImageIcon fontSize="inherit" />
                        </IconButton>
                        <Input
                            type="file"
                            id="uploadImage"
                            accept="image/*"
                            ref={imageUploadRef}
                            onChange={handleImageChange}
                            sx={{ display: "none" }}
                        ></Input>
                        {imagePreview && validImage ? (
                            <ImagePreviewContainer
                                sx={{
                                    backgroundColor: isDarkMode
                                        ? "rgba(255, 255, 255, 0.09)"
                                        : "rgba(0, 0, 0, 0.06)",
                                }}
                            >
                                <ImagePreviewBox>
                                    <ImagePreview
                                        component="img"
                                        src={imagePreview}
                                    ></ImagePreview>
                                    <RemoveImagePreviewButton
                                        sx={{
                                            fontSize: "12px",
                                            backgroundColor: isDarkMode
                                                ? "grey.800"
                                                : "#fff",
                                            "&:hover": {
                                                backgroundColor: isDarkMode
                                                    ? "grey.700"
                                                    : "grey.200",
                                            },
                                        }}
                                        onClick={handleDeleteImagePreview}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </RemoveImagePreviewButton>
                                </ImagePreviewBox>
                            </ImagePreviewContainer>
                        ) : (
                            <ChatTextField
                                id="search"
                                variant="filled"
                                className="roundedInput"
                                autoComplete="off"
                                placeholder="Write a message"
                                fullWidth
                                onChange={handleMessageChange}
                                onKeyDown={handleKeyPress}
                                value={message}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment
                                            className="searchIcon"
                                            position="end"
                                        >
                                            <IconButton
                                                size="medium"
                                                sx={{ color: "#1976d2" }}
                                                onClick={handleOpenEmojiMenu}
                                            >
                                                <EmojiEmotionsIcon fontSize="inherit" />
                                            </IconButton>
                                            <Menu
                                                id="menu-btn"
                                                anchorEl={anchorEl}
                                                open={open}
                                                onClose={handleCloseEmojiMenu}
                                                anchorOrigin={{
                                                    vertical: "top",
                                                    horizontal: "center",
                                                }}
                                                transformOrigin={{
                                                    vertical: "bottom",
                                                    horizontal: "center",
                                                }}
                                            >
                                                <Stack direction="row">
                                                    {emojis &&
                                                        emojis.map(
                                                            (emoji, i) => (
                                                                <MenuItem
                                                                    key={i}
                                                                    onClick={() =>
                                                                        addEmoji(
                                                                            emoji
                                                                        )
                                                                    }
                                                                >
                                                                    {emoji}
                                                                </MenuItem>
                                                            )
                                                        )}
                                                </Stack>
                                            </Menu>
                                        </InputAdornment>
                                    ),
                                    disableUnderline: true, // <== added this
                                }}
                                multiline
                                minRows={1}
                                maxRows={4}
                            ></ChatTextField>
                        )}

                        {message || imagePreview ? (
                            <IconButton
                                aria-label="send message"
                                size="medium"
                                sx={{
                                    alignSelf: "flex-end",
                                    marginBottom: "10px",
                                    color: "#1976d2",
                                }}
                                onClick={() =>
                                    imagePreview ? sendImage() : sendMessage()
                                }
                            >
                                <SendIcon fontSize="inherit" />
                            </IconButton>
                        ) : (
                            <IconButton
                                aria-label="send like emoji"
                                size="medium"
                                sx={{
                                    alignSelf: "flex-end",
                                    marginBottom: "10px",
                                    color: "#1976d2",
                                }}
                                onClick={() => sendMessage()}
                            >
                                <ThumbUpIcon fontSize="inherit" />
                            </IconButton>
                        )}
                    </CBSender>
                </>
            ) : (
                <Typography
                    mx="auto"
                    variant="h5"
                    fontWeight={700}
                    component="h3"
                >
                    Select a chat or start a new conversation
                </Typography>
            )}
        </>
    );
};

export default ChatBox;
