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

    // Children state
    const [childrenList, setChildrenList] = useState<{ name: string; gender: "Male" | "Female" | ""; dob: string }[]>([]);
    const [childInput, setChildInput] = useState({ name: "", gender: "Male" as "Male" | "Female", dob: "" });

    // Spouse State (since we use react-hook-form, we might not need local state for simple inputs unless we want controlled inputs for conditional rendering, but 'watch' handles that. We just need to register them.)


    // Children state


    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isBloodGroupOther, setIsBloodGroupOther] = useState(false);

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
    const maritalStatus = watch("maritalStatus");

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

    const addChild = () => {
        if (childInput.name.trim()) {
            const newList = [...childrenList, { ...childInput, name: childInput.name.trim() }];
            setChildrenList(newList);
            setChildInput({ name: "", gender: "Male", dob: "" });
            // @ts-ignore
            setValue("children", newList);
        } else {
            showToast("Please enter child name", "error");
        }
    };

    const removeChild = (index: number) => {
        const newList = childrenList.filter((_, i) => i !== index);
        setChildrenList(newList);
        // @ts-ignore
        setValue("children", newList);
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

            // Handle Children
            if (childrenList.length > 0) {
                textData['children'] = childrenList;
            }

            // Handle Spouse (handled by RHF register, but ensured here)
            if (data.maritalStatus === "Married") {
                // Should already be in data, but let's ensure redundant matching if needed or just trust RHF
            } else {
                // If single, remove spouse fields if they exist
                delete textData['spouseName'];
                delete textData['spouseEmploymentStatus'];
            }

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
                className="text-center mb-10 flex flex-col items-center"
            >
                {/* Logo & Branding */}
                <div className="mb-4">
                    {/* Logo */}
                    <div className="mx-auto mb-2">
                        <img src="/logo.svg" alt="ARTIBOTS Logo" className="w-24 h-24 mx-auto object-contain" />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-black mb-1 tracking-tight uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    ARTIBOTS
                </h1>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                    Employee Identity Card Form
                </h2>
                <p className="text-gray-500 text-lg">
                    Please fill in the details below to generate your ID card.
                </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                {/* 1. Personal Details */}
                <Section title="1. Personal Details" delay={0.1}>
                    <Input
                        label="Full Name (as per Govt ID)"
                        placeholder="Full Name"
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
                        label="Marital Status"
                        options={[
                            { value: "Single", label: "Single/Unmarried" },
                            { value: "Married", label: "Married" },
                        ]}
                        registration={register("maritalStatus")}
                        error={errors.maritalStatus?.message}
                        required
                    />
                    <Select
                        label="Gender"
                        options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Others", label: "Others" },
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
                        placeholder="name@gmail.com"
                        registration={register("email")}
                        error={errors.email?.message}
                        required
                    />
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Contact Address <span className="text-red-500">*</span></label>
                            <textarea
                                placeholder="(door no, street name, area, city, district, state, country, pincode)"
                                className={`px-4 py-2 rounded-xl border bg-white/50 border-gray-200 outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[100px] ${errors.contactAddress ? 'border-red-500' : ''}`}
                                {...register("contactAddress")}
                            />
                            {errors.contactAddress && <span className="text-xs text-red-500 font-medium">{errors.contactAddress.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Permanent Address <span className="text-red-500">*</span></label>
                            <textarea
                                placeholder="(door no, street name, area, city, district, state, country, pincode)"
                                className={`px-4 py-2 rounded-xl border bg-white/50 border-gray-200 outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[100px] ${errors.permanentAddress ? 'border-red-500' : ''}`}
                                {...register("permanentAddress")}
                            />
                            {errors.permanentAddress && <span className="text-xs text-red-500 font-medium">{errors.permanentAddress.message}</span>}
                        </div>
                    </div>
                </Section>

                {/* 3. Family Details */}
                <Section title="3. Family Details" delay={0.3}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Father Name"
                            registration={register("fatherName")}
                            error={errors.fatherName?.message}
                            required
                        />
                        <Input
                            type="number"
                            label="Father Age"
                            registration={register("fatherAge")}
                            error={errors.fatherAge?.message}
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
                            label="Mother Age"
                            registration={register("motherAge")}
                            error={errors.motherAge?.message}
                            required
                        />
                    </div>
                    <Input
                        type="number"
                        label="Total Family Members"
                        registration={register("totalFamilyMembers")}
                        error={errors.totalFamilyMembers?.message}
                        required
                    />


                    {/* Spouse Details (Only if Married) */}
                    {maritalStatus === "Married" && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 space-y-5 shadow-sm">
                            <h4 className="flex items-center gap-2 font-bold text-gray-700 border-b border-gray-100 pb-3 mb-2">
                                <span className="text-xl">💍</span> Spouse Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Spouse Name"
                                    registration={register("spouseName")}
                                    error={errors.spouseName?.message}
                                />
                                <Select
                                    label="Spouse Employment Status"
                                    options={[
                                        { value: "Employed", label: "Employed" },
                                        { value: "Unemployed", label: "Unemployed" }
                                    ]}
                                    registration={register("spouseEmploymentStatus")}
                                    error={errors.spouseEmploymentStatus?.message}
                                />
                            </div>
                        </div>
                    )}

                    {/* Children Management - Linked to Marital Status */}
                    {maritalStatus === "Married" && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 space-y-5 shadow-sm mt-6">
                            <h4 className="flex items-center gap-2 font-bold text-gray-700 border-b border-gray-100 pb-3 mb-2">
                                <span className="text-xl">👶</span> Children Details
                            </h4>

                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Child Name</label>
                                        <input
                                            type="text"
                                            value={childInput.name}
                                            onChange={(e) => setChildInput({ ...childInput, name: e.target.value })}
                                            placeholder="Name"
                                            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Gender</label>
                                        <select
                                            value={childInput.gender}
                                            onChange={(e) => setChildInput({ ...childInput, gender: e.target.value as any })}
                                            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={childInput.dob}
                                            onChange={(e) => setChildInput({ ...childInput, dob: e.target.value })}
                                            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <button
                                            type="button"
                                            onClick={addChild}
                                            className="w-full py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} /> Add Child
                                        </button>
                                    </div>
                                </div>

                                {/* List of Children */}
                                <div className="space-y-2">
                                    {childrenList.map((child, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-gray-800">{child.name}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{child.gender}</span>
                                                {child.dob && <span className="text-xs text-gray-500">DOB: {child.dob}</span>}
                                            </div>
                                            <button type="button" onClick={() => removeChild(idx)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sibling Management (Hidden if Married) */}
                    {maritalStatus !== "Married" && (
                        <div className="md:col-span-2 space-y-4 pt-2 border-t border-gray-100 mt-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Siblings</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={siblingInput}
                                        onChange={(e) => setSiblingInput(e.target.value)}
                                        placeholder="Enter sibling name"
                                        className="flex-1 px-4 py-2.5 rounded-xl border bg-white/50 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSibling}
                                        className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition flex items-center gap-2 font-medium"
                                    >
                                        <Plus size={18} /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {siblingsList.map((sib, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium border border-cyan-100">
                                            <span>{sib.name}</span>
                                            {/* Show checkmark if details are filled */}
                                            {sib.maritalStatus && sib.employmentStatus && (
                                                <span className="text-green-600 text-[10px] uppercase font-bold tracking-wider ml-1 bg-green-100 px-1 rounded">Saved</span>
                                            )}
                                            <button type="button" onClick={() => removeSibling(idx)} className="text-cyan-400 hover:text-red-500 ml-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sibling Details Editor */}
                            {siblingsList.length > 0 && (
                                <div className="bg-gray-50/80 p-5 rounded-2xl border border-cyan-100 mt-4 space-y-4">
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
                                                <h4 className="font-semibold text-gray-700">Details for <span className="underline decoration-cyan-500">{selectedSiblingName}</span></h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-gray-700">Marital Status</label>
                                                    <div className="flex gap-4">
                                                        {["Single", "Married"].map((status) => (
                                                            <label key={status} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-cyan-300 transition">
                                                                <input
                                                                    type="radio"
                                                                    name="sib_marital"
                                                                    checked={editMarital === status}
                                                                    onChange={() => setEditMarital(status as any)}
                                                                    className="w-4 h-4 text-cyan-600 accent-cyan-600"
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
                                                            <label key={status} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-cyan-300 transition">
                                                                <input
                                                                    type="radio"
                                                                    name="sib_employ"
                                                                    checked={editEmployment === status}
                                                                    onChange={() => setEditEmployment(status as any)}
                                                                    className="w-4 h-4 text-cyan-600 accent-cyan-600"
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
                                                className="w-full py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition font-medium shadow-sm hover:shadow-md"
                                            >
                                                Save Details for {selectedSiblingName}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
                        options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Others"].map(bg => ({ value: bg, label: bg }))}
                        registration={register("bloodGroup", {
                            onChange: (e) => {
                                const selectedValue = e.target.value;
                                setIsBloodGroupOther(selectedValue === "Others");
                                // If "Others" is selected, clear the current bloodGroup value
                                // It will be filled by the "Specify Blood Group" input
                                if (selectedValue === "Others") {
                                    setValue("bloodGroup", ""); // Clear it initially
                                }
                            }
                        })}
                        error={errors.bloodGroup?.message}
                        required
                    />
                    {isBloodGroupOther && (
                        <div className="col-span-1 md:col-span-1">
                            <Input
                                label="Specify Blood Group"
                                placeholder="Enter Blood Group"
                                registration={register("bloodGroup", {
                                    required: "Please specify your blood group",
                                    validate: (value) => value !== "Others" || "Please specify your blood group"
                                })}
                            />
                        </div>
                    )}
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
                            placeholder="e.g. enter family member name"
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
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 border border-cyan-400/20"
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
                    className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 border backdrop-blur-md ${toast.type === "success"
                        ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/50 shadow-emerald-500/20"
                        : "bg-red-900/90 text-red-100 border-red-500/50 shadow-red-500/20"
                        }`}
                >
                    <div className="font-semibold">{toast.message}</div>
                </motion.div>
            )}
        </div>
    );
};


