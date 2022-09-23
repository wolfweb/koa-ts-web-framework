import {config} from "dotenv";

config();

import App from "@/app";

console.log(`Server is running on port ${(process.env.PORT || 3000)}, process.env.NODE_ENV: ${process.env.NODE_ENV}`);
App.listen(process.env.PORT || 3000);