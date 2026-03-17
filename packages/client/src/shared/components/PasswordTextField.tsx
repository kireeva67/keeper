import { IconButton, InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export function PasswordTextField(props: TextFieldProps) {
    const [show, setShow] = useState(false);

    return (
        <TextField
            {...props}
            type={show ? "text" : "password"}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShow(s => !s)} edge="end">
                                {show ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                            </IconButton>
                        </InputAdornment>
                    )
                }
            }}
        />
    )
}