import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, Trash2, Send, Loader2 } from "lucide-react";
import { employeeSchema, type EmployeeFormData } from "../lib/schema";
import { Input } from "./Input";
import { Select } from "./Select";
import { FileUpload } from "./FileUpload";
import { Section } from "./Section";

export const EmployeeForm: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Sibling state now stores objects
    const [siblingsList, setSiblingsList] = useState<{ name: string; maritalStatus: "Single" | "Married" | ""; employmentStatus: "Employed" | "Unemployed" | "" }[]>([]);
    const [siblingInput, setSiblingInput] = useState("");

    // Local state for editing the selected sibling
    const [editMarital, setEditMarital] = useState<"Single" | "Married" | "">("");
    const [editEmployment, setEditEmployment] = useState<"Employed" | "Unemployed" | "">("");

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<EmployeeFormData>({
        // @ts-ignore
        resolver: zodResolver(employeeSchema),
    });

    // Watchers
    const photo = watch("photo");
    const aadhaar = watch("aadhaar");
    const pan = watch("pan");
    const birthCertificate = watch("birthCertificate");
    const educationalCertificates = watch("educationalCertificates");
    const communityCertificate = watch("communityCertificate");
    const incomeCertificate = watch("incomeCertificate");
    const nativityCertificate = watch("nativityCertificate");
    const selectedSiblingName = watch("selectedSibling");

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Effect: Sync editor state when a sibling is selected
    React.useEffect(() => {
        if (selectedSiblingName) {
            const sib = siblingsList.find(s => s.name === selectedSiblingName);
            if (sib) {
                setEditMarital(sib.maritalStatus);
                setEditEmployment(sib.employmentStatus);
            } else {
                setEditMarital("");
                setEditEmployment("");
            }
        }
    }, [selectedSiblingName, siblingsList]);

    const addSibling = () => {
        if (siblingInput.trim()) {
            if (siblingsList.some(s => s.name.toLowerCase() === siblingInput.trim().toLowerCase())) {
                showToast("Sibling already exists", "error");
                return;
            }
            const newList = [...siblingsList, { name: siblingInput.trim(), maritalStatus: "" as const, employmentStatus: "" as const }];
            setSiblingsList(newList);
            setSiblingInput("");

            // @ts-ignore
            setValue("siblings", newList);
        }
    };

    const removeSibling = (index: number) => {
        const newList = siblingsList.filter((_, i) => i !== index);
        setSiblingsList(newList);
        // @ts-ignore
        setValue("siblings", newList);

        // If the removed sibling was selected, reset selection
        if (selectedSiblingName && siblingsList[index].name === selectedSiblingName) {
            setValue("selectedSibling", "");
        }
    };

    const saveSiblingDetails = () => {
        if (!selectedSiblingName) return;
        if (!editMarital || !editEmployment) {
            showToast("Please select both statuses for the sibling", "error");
            return;
        }

        const updatedList = siblingsList.map(s =>
            s.name === selectedSiblingName
                ? { ...s, maritalStatus: editMarital, employmentStatus: editEmployment }
                : s
        );

        setSiblingsList(updatedList);
        // @ts-ignore
        setValue("siblings", updatedList);
        showToast(`Details saved for ${selectedSiblingName}`, "success");
    };

    const onSubmit: SubmitHandler<EmployeeFormData> = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            const textData: any = {};

            // Separate files and text
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof FileList) {
                    // Handle files
                    // Single file fields
                    if (key !== "educationalCertificates") {
                        if (value.length > 0) {
                            formData.append(key, value[0]);
                        }
                    } else {
                        // Multiple files
                        Array.from(value).forEach((file) => {
                            formData.append(key, file);
                        });
                    }
                } else {
                    // Collect text data
                    textData[key] = value;
                }
            });

            // Explicitly handle siblings (they are already in 'data' but might filter empty ones if needed)
            // The hook form 'data' object already contains the siblings array.

            // Append JSON string
            formData.append('data', JSON.stringify(textData));

            // Real API call
            const response = await fetch('https://id-form-backend.onrender.com/api/employees', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log("Server response:", result);

            showToast("Application submitted successfully!", "success");
            reset();
            setSiblingsList([]);
            setSiblingInput("");
        } catch (error) {
            console.error(error);
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">
                    Employee Identity Card
                </h1>
                <p className="text-gray-500 text-lg">
                    Please fill in the details below to generate your ID card.
                </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                {/* 1. Personal Details */}
                <Section title="1. Personal Details" delay={0.1}>
                    <Input
                        label="Full Name (as per Govt ID)"
                        placeholder="e.g. John Doe"
                        registration={register("fullName")}
                        error={errors.fullName?.message}
                        required
                    />
                    <Input
                        type="date"
                        label="Date of Birth"
                        registration={register("dob")}
                        error={errors.dob?.message}
                        required
                    />
                    <Select
                        label="Gender"
                        options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                        ]}
                        registration={register("gender")}
                        error={errors.gender?.message}
                        required
                    />
                    <FileUpload
                        label="Passport Size Photo"
                        accept="image/*"
                        registration={register("photo")}
                        error={errors.photo?.message as string}
                        className="md:col-span-1 h-full"
                        selectedFiles={photo}
                    />
                </Section>

                {/* 2. Contact Details */}
                <Section title="2. Contact Details" delay={0.2}>
                    <Input
                        label="Contact Number"
                        placeholder="e.g. 9876543210"
                        registration={register("contactNumber")}
                        error={errors.contactNumber?.message}
                        required
                    />
                    <Input
                        label="Emergency Contact Number"
                        placeholder="e.g. 9876543210"
                        registration={register("emergencyContact")}
                        error={errors.emergencyContact?.message}
                        required
                    />
                    <Input
                        label="Email ID"
                        type="email"
                        placeholder="john@example.com"
                        registration={register("email")}
                        error={errors.email?.message}
                        required
                    />
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Contact Address <span className="text-red-500">*</span></label>
                            <textarea
                                className={`px-4 py-2 rounded-xl border bg-white/50 border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] ${errors.contactAddress ? 'border-red-500' : ''}`}
                                {...register("contactAddress")}
                            />
                            {errors.contactAddress && <span className="text-xs text-red-500 font-medium">{errors.contactAddress.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Permanent Address <span className="text-red-500">*</span></label>
                            <textarea
                                className={`px-4 py-2 rounded-xl border bg-white/50 border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] ${errors.permanentAddress ? 'border-red-500' : ''}`}
                                {...register("permanentAddress")}
                            />
                            {errors.permanentAddress && <span className="text-xs text-red-500 font-medium">{errors.permanentAddress.message}</span>}
                        </div>
                    </div>
                </Section>

                {/* 3. Family Details */}
                <Section title="3. Family Details" delay={0.3}>
                    <Input
                        label="Father Name"
                        registration={register("fatherName")}
                        error={errors.fatherName?.message}
                        required
                    />
                    <Input
                        label="Mother Name"
                        registration={register("motherName")}
                        error={errors.motherName?.message}
                        required
                    />
                    <Input
                        type="number"
                        label="Total Family Members"
                        registration={register("totalFamilyMembers")}
                        error={errors.totalFamilyMembers?.message}
                        required
                    />

                    {/* Sibling Management */}
                    <div className="md:col-span-2 space-y-4 pt-2 border-t border-gray-100">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Siblings</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={siblingInput}
                                    onChange={(e) => setSiblingInput(e.target.value)}
                                    placeholder="Enter sibling name"
                                    className="flex-1 px-4 py-2.5 rounded-xl border bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addSibling}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                                >
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {siblingsList.map((sib, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                        <span>{sib.name}</span>
                                        {/* Show checkmark if details are filled */}
                                        {sib.maritalStatus && sib.employmentStatus && (
                                            <span className="text-green-600 text-[10px] uppercase font-bold tracking-wider ml-1 bg-green-100 px-1 rounded">Saved</span>
                                        )}
                                        <button type="button" onClick={() => removeSibling(idx)} className="text-blue-400 hover:text-red-500 ml-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sibling Details Editor */}
                        {siblingsList.length > 0 && (
                            <div className="bg-gray-50/80 p-5 rounded-2xl border border-blue-100 mt-4 space-y-4">
                                <Select
                                    label="Select Sibling to Edit Details"
                                    options={siblingsList.map(s => ({ value: s.name, label: s.name }))}
                                    registration={register("selectedSibling")}
                                    error={errors.selectedSibling?.message}
                                />

                                {selectedSiblingName && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-4 pt-2 border-t border-gray-200/60"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-blue-900">Details for <span className="underline">{selectedSiblingName}</span></h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">Marital Status</label>
                                                <div className="flex gap-4">
                                                    {["Single", "Married"].map((status) => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                                                            <input
                                                                type="radio"
                                                                name="sib_marital"
                                                                checked={editMarital === status}
                                                                onChange={() => setEditMarital(status as any)}
                                                                className="w-4 h-4 text-blue-600 accent-blue-600"
                                                            />
                                                            <span className="text-gray-700 text-sm">{status}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">Employment Status</label>
                                                <div className="flex gap-4">
                                                    {["Employed", "Unemployed"].map((status) => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                                                            <input
                                                                type="radio"
                                                                name="sib_employ"
                                                                checked={editEmployment === status}
                                                                onChange={() => setEditEmployment(status as any)}
                                                                className="w-4 h-4 text-blue-600 accent-blue-600"
                                                            />
                                                            <span className="text-gray-700 text-sm">{status}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={saveSiblingDetails}
                                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                                        >
                                            Save Details for {selectedSiblingName}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>


                </Section>

                {/* 4. Job Details */}
                <Section title="4. Job Details" delay={0.4}>
                    <Input
                        label="Department"
                        registration={register("department")}
                        error={errors.department?.message}
                        required
                    />
                    <Input
                        label="Designation"
                        registration={register("designation")}
                        error={errors.designation?.message}
                        required
                    />
                    <Input
                        type="date"
                        label="Joining Date"
                        registration={register("joiningDate")}
                        error={errors.joiningDate?.message}
                        required
                    />
                    <Select
                        label="Blood Group"
                        options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => ({ value: bg, label: bg }))}
                        registration={register("bloodGroup")}
                        error={errors.bloodGroup?.message}
                        required
                    />
                </Section>

                {/* 5. Bank & Nominee Details */}
                <Section title="5. Bank & Nominee Details" delay={0.5}>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Bank Name"
                            placeholder="e.g. HDFC Bank"
                            registration={register("bankName")}
                            error={errors.bankName?.message}
                            required
                        />
                        <Input
                            label="Account Number"
                            placeholder="e.g. 1234567890"
                            registration={register("accountNumber")}
                            error={errors.accountNumber?.message}
                            required
                        />
                        <Input
                            label="IFSC Code"
                            placeholder="e.g. HDFC0001234"
                            registration={register("ifscCode")}
                            error={errors.ifscCode?.message}
                            className="uppercase"
                            required
                        />
                        <Input
                            label="Nominee Name (for PF & ESI)"
                            placeholder="e.g. Jane Doe"
                            registration={register("nomineeName")}
                            error={errors.nomineeName?.message}
                            required
                        />
                    </div>
                </Section>

                {/* 6. Documents Upload */}
                <Section title="6. Documents Upload" delay={0.6}>
                    <FileUpload
                        label="Aadhaar Card"
                        accept=".pdf,.jpg,.jpeg,.png"
                        registration={register("aadhaar")}
                        error={errors.aadhaar?.message as string}
                        selectedFiles={aadhaar}
                    />
                    <FileUpload
                        label="PAN Card"
                        accept=".pdf,.jpg,.jpeg,.png"
                        registration={register("pan")}
                        error={errors.pan?.message as string}
                        selectedFiles={pan}
                    />
                    <FileUpload
                        label="Birth Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        registration={register("birthCertificate")}
                        error={errors.birthCertificate?.message as string}
                        selectedFiles={birthCertificate}
                    />
                    <FileUpload
                        label="Educational Certificates (Combine all into one PDF: 10th, 12th, College Marksheet, TC, Degree, Consolidate, Provisional)"
                        accept=".pdf"
                        registration={register("educationalCertificates")}
                        error={errors.educationalCertificates?.message as string}
                        multiple
                        selectedFiles={educationalCertificates}
                    />
                    <FileUpload
                        label="Community Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        registration={register("communityCertificate")}
                        error={errors.communityCertificate?.message as string}
                        selectedFiles={communityCertificate}
                    />
                    <FileUpload
                        label="Income Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        registration={register("incomeCertificate")}
                        error={errors.incomeCertificate?.message as string}
                        selectedFiles={incomeCertificate}
                    />
                    <FileUpload
                        label="Nativity Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        registration={register("nativityCertificate")}
                        error={errors.nativityCertificate?.message as string}
                        selectedFiles={nativityCertificate}
                    />
                </Section>

                <motion.div
                    className="flex justify-end pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" /> Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={18} /> Submit Application
                            </>
                        )}
                    </button>
                </motion.div>
            </form>

            {/* Toast Notification */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                        }`}
                >
                    <div className="font-semibold">{toast.message}</div>
                </motion.div>
            )}
        </div>
    );
};
