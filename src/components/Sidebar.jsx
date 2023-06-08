import {
    Stack,
    styled,
    IconButton,
    Avatar,
    Badge,
    Tooltip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";

const SideBarMain = styled(Stack)(({ theme }) => ({
    paddingTop: "10px",
    paddingBottom: "15px",
    width: "60px",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    borderRightWidth: "thin",
}));

const UpperIconButtonContainer = styled(Stack)(({ theme }) => ({
    alignItems: "center",
    gap: 2,
}));

const IconButtonRounded = styled(IconButton)(({ theme }) => ({
    borderRadius: "8px",
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    cursor: "pointer",
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
            border: "1px solid currentColor",
            content: '""',
        },
    },
}));

const Sidebar = ({
    userInfo,
    userProfileImage,
    mdBelow,
    handleLogout,
    setViewFriendsDialogOpen,
    hasUnopenedFriendRequest,
    updateAllFriendRequestsReceivedToSeen,
    setViewProfileDialogOpen,
}) => {
    const handleOpenFriendsDialogue = () => {
        updateAllFriendRequestsReceivedToSeen();
        setViewFriendsDialogOpen(true);
    };

    return (
        <SideBarMain display={mdBelow ? "none" : "flex"}>
            <UpperIconButtonContainer>
                <Tooltip title="Friend Requests" placement="right">
                    <IconButtonRounded
                        size="large"
                        onClick={handleOpenFriendsDialogue}
                    >
                        {hasUnopenedFriendRequest ? (
                            <Badge
                                variant="dot"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        backgroundColor: "#1976d2",
                                    },
                                }}
                            >
                                <PeopleIcon />
                            </Badge>
                        ) : (
                            <PeopleIcon />
                        )}
                    </IconButtonRounded>
                </Tooltip>
                <Tooltip title="Sign out" placement="right">
                    <IconButtonRounded size="large" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButtonRounded>
                </Tooltip>
            </UpperIconButtonContainer>
            <Tooltip title="View Profile" placement="right">
                <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                    onClick={() => setViewProfileDialogOpen(true)}
                >
                    <Avatar
                        src={userProfileImage}
                        alt={`${userInfo?.firstName} ${userInfo?.lastName}`}
                        sx={{
                            width: "45px",
                            height: "45px",
                        }}
                    />
                </StyledBadge>
            </Tooltip>
        </SideBarMain>
    );
};

export default Sidebar;
