import React, { useState } from "react";

const CheckboxSearch = ({ checked, setChecked }: { checked: boolean; setChecked: (checked: boolean) => void }) => {
    return (
        <button onClick={() => setChecked(!checked)}>
            {checked ? "Online search" : "Offline search"}
        </button>
    );
};

export default CheckboxSearch;
