import * as z from 'zod';


import { EditProfileSchema } from "./EditProfileSchema";
export {EditProfileSchema} from "./EditProfileSchema"

export type EditProfileSchemaType = z.infer<typeof EditProfileSchema>;