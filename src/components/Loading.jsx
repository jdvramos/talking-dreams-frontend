import { Box, styled, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const CenteredBox = styled(Box)(({ theme }) => ({
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const Loading = () => {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowMessage(true);
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <CenteredBox>
            {showMessage ? (
                <Box width="90%" textAlign="center" color="text.primary">
                    <Typography variant="body1" mb={2}>
                        The server is getting ready to serve your request.
                        Please hold on for a moment.
                    </Typography>
                    <CircularProgress />
                </Box>
            ) : (
                <CircularProgress />
            )}
        </CenteredBox>
    );
};

export default Loading;
