import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

// Helper to validate file list
const fileSchema = (required = true, types = ACCEPTED_IMAGE_TYPES) =>
    z.custom<FileList>()
        .refine((files) => !required || (files && files.length > 0), "File is required")
        .refine((files) => !files || files.length === 0 || Array.from(files).every(file => file.size <= MAX_FILE_SIZE), "Max file size is 5MB")
        .refine((files) => !files || files.length === 0 || Array.from(files).every(file => types.includes(file.type)), "Invalid file type");

export const employeeSchema = z.object({
    // Personal
    fullName: z.string().min(2, "Full Name is required"),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Date of Birth is required"),
    gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required" }),
    photo: fileSchema(true, ACCEPTED_IMAGE_TYPES),

    // Contact
    contactNumber: z.string().regex(/^\d{10,15}$/, "Must be 10-15 digits"),
    emergencyContact: z.string().min(10, "Emergency contact required"),
    contactAddress: z.string().min(10, "Address is too short"),
    permanentAddress: z.string().min(10, "Address is too short"),
    email: z.string().email("Invalid email address"),

    // Family
    fatherName: z.string().min(2, "Father Name is required"),
    fatherAge: z.preprocess((val) => Number(val), z.number().min(18, "Age must be valid")),
    motherName: z.string().min(2, "Mother Name is required"),
    motherAge: z.preprocess((val) => Number(val), z.number().min(18, "Age must be valid")),
    maritalStatus: z.enum(["Single", "Married"], { message: "Marital Status is required" }),
    spouseName: z.string().optional(),
    spouseMaritalStatus: z.enum(["Single", "Married"]).optional(),
    spouseEmploymentStatus: z.enum(["Employed", "Unemployed"]).optional(),
    totalFamilyMembers: z.preprocess((val) => Number(val), z.number().min(1, "At least 1 member")),

    // Siblings (conditional validation handled in component or refined here if needed)
    siblings: z.array(z.object({
        name: z.string().min(1, "Name required"),
        maritalStatus: z.enum(["Single", "Married"], { message: "Status required" }),
        employmentStatus: z.enum(["Employed", "Unemployed"], { message: "Status required" })
    })).optional(),
    selectedSibling: z.string().optional(),

    // Children (conditional)
    children: z.array(z.object({
        name: z.string().min(1, "Name required"),
        gender: z.enum(["Male", "Female"], { message: "Gender required" }),
        dob: z.string().optional(), // Optional for now
    })).optional(),

    // Job (Employee's details)
    department: z.string().min(2, "Department is required"),
    designation: z.string().min(2, "Designation is required"),
    joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Joining Date is required"),
    bloodGroup: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"], { message: "Blood Group is required" }),

    // Bank & Nominee
    bankName: z.string().min(2, "Bank Name is required"),
    accountNumber: z.string().min(8, "Account Number must be valid"),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code"),
    nomineeName: z.string().min(2, "Nominee Name is required"),

    // Documents
    aadhaar: fileSchema(true, ACCEPTED_DOC_TYPES),
    pan: fileSchema(true, ACCEPTED_DOC_TYPES),
    birthCertificate: fileSchema(true, ACCEPTED_DOC_TYPES),
    educationalCertificates: fileSchema(true, ACCEPTED_DOC_TYPES), // Multiple allow handled in component
    communityCertificate: fileSchema(true, ACCEPTED_DOC_TYPES),
    incomeCertificate: fileSchema(true, ACCEPTED_DOC_TYPES),
    nativityCertificate: fileSchema(true, ACCEPTED_DOC_TYPES),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
