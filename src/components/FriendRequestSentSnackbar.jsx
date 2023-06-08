import { Alert, Snackbar } from "@mui/material";
import { BsSendCheck } from "react-icons/bs";

const FriendRequestSentSnackbar = ({
    showFriendRequestSentAlert,
    setShowFriendRequestSentAlert,
    isDarkMode,
    smBelow,
}) => {
    return (
        <Snackbar
            open={showFriendRequestSentAlert}
            onClose={() => setShowFriendRequestSentAlert(false)}
            autoHideDuration={4000}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            sx={smBelow ? { width: "350px", bottom: "20px" } : {}}
        >
            <Alert
                iconMapping={{
                    info: <BsSendCheck size={20} />,
                }}
                severity="info"
                sx={{
                    backgroundColor: isDarkMode
                        ? "info.dark"
                        : "rgb(229, 246, 253)",
                    color: isDarkMode ? "text.primary" : "rgb(1, 67, 97)",
                    "& .MuiAlert-icon": {
                        alignSelf: "center",
                        color: isDarkMode ? "text.primary" : "rgb(1, 67, 97)",
                    },
                }}
            >
                Friend request sent successfully!
            </Alert>
        </Snackbar>
    );
};

export default FriendRequestSentSnackbar;
