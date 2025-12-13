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

    // Spouse state
    const [spousesList, setSpousesList] = useState<{ name: string; maritalStatus: "Single" | "Married" | ""; employmentStatus: "Employed" | "Unemployed" | "" }[]>([]);
    const [spouseInput, setSpouseInput] = useState("");
    const [selectedSpouseName, setSelectedSpouseName] = useState("");
    const [editSpouseMarital, setEditSpouseMarital] = useState<"Single" | "Married" | "">("");
    const [editSpouseEmployment, setEditSpouseEmployment] = useState<"Employed" | "Unemployed" | "">("");

    // Children state
    const [childrenList, setChildrenList] = useState<{ name: string; gender: "Male" | "Female" | ""; dob?: string }[]>([]);
    const [childNameInput, setChildNameInput] = useState("");
    const [childGenderInput, setChildGenderInput] = useState<"Male" | "Female" | "">("");

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

    // Effect: Sync editor state when a spouse is selected
    React.useEffect(() => {
        if (selectedSpouseName) {
            const sp = spousesList.find(s => s.name === selectedSpouseName);
            if (sp) {
                setEditSpouseMarital(sp.maritalStatus);
                setEditSpouseEmployment(sp.employmentStatus);
            } else {
                setEditSpouseMarital("");
                setEditSpouseEmployment("");
            }
        }
    }, [selectedSpouseName, spousesList]);

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

    const addSpouse = () => {
        if (spouseInput.trim()) {
            // Limit to 1 spouse usually, but logically 'like siblings' allows list. 
            // We'll allow list but user likely adds one.
            if (spousesList.some(s => s.name.toLowerCase() === spouseInput.trim().toLowerCase())) {
                showToast("Spouse already exists", "error");
                return;
            }
            const newList = [...spousesList, { name: spouseInput.trim(), maritalStatus: "" as const, employmentStatus: "" as const }];
            setSpousesList(newList);
            setSpouseInput("");
        }
    };

    const removeSpouse = (index: number) => {
        const newList = spousesList.filter((_, i) => i !== index);
        setSpousesList(newList);
        if (selectedSpouseName && spousesList[index].name === selectedSpouseName) {
            setSelectedSpouseName("");
        }
    };

    const saveSpouseDetails = () => {
        if (!selectedSpouseName) return;
        if (!editSpouseMarital || !editSpouseEmployment) {
            showToast("Please select both statuses for the spouse", "error");
            return;
        }

        const updatedList = spousesList.map(s =>
            s.name === selectedSpouseName
                ? { ...s, maritalStatus: editSpouseMarital, employmentStatus: editSpouseEmployment }
                : s
        );

        setSpousesList(updatedList);
        // We'll sync to form values at submit or here if we mapped to hidden fields. 
        // For now, local state handles it until submit.
        showToast(`Details saved for ${selectedSpouseName}`, "success");
    };

    const addChild = () => {
        if (!childNameInput.trim() || !childGenderInput) {
            showToast("Please enter child name and gender", "error");
            return;
        }
        const newList = [...childrenList, { name: childNameInput.trim(), gender: childGenderInput }];
        setChildrenList(newList);
        setChildNameInput("");
        setChildGenderInput("");
        // @ts-ignore
        setValue("children", newList);
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

            // Handle Spouse List -> Single Mapping
            if (data.maritalStatus === "Married" && spousesList.length > 0) {
                // Take the last one or first one? Usually 1.
                const mainSpouse = spousesList[0];
                textData['spouseName'] = mainSpouse.name;
                textData['spouseMaritalStatus'] = mainSpouse.maritalStatus;
                textData['spouseEmploymentStatus'] = mainSpouse.employmentStatus;
            }

            // Append JSON string
            formData.append('data', JSON.stringify(textData));

            // Real API call
            const response = await fetch('/api/employees', {
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

                <h1 className="text-4xl font-extrabold text-gray-600 mb-1 tracking-tight uppercase">
                    ARTIBOT<span className="text-cyan-500">S</span>
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

                    {/* Conditional Family Logic */}
                    {maritalStatus === "Married" ? (
                        <>
                            <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 mb-6 space-y-5 shadow-sm">
                                <h4 className="flex items-center gap-2 font-bold text-gray-700 border-b border-cyan-100 pb-3 mb-2">
                                    <span className="text-xl">💍</span> Spouse Details
                                </h4>

                                {/* Spouse Name Input & Add */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Add Spouse Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={spouseInput}
                                            onChange={(e) => setSpouseInput(e.target.value)}
                                            placeholder="Enter spouse name"
                                            className="flex-1 px-4 py-2.5 rounded-xl border bg-white/50 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSpouse}
                                            className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition flex items-center gap-2 font-medium"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {spousesList.map((sp, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium border border-cyan-100">
                                                <span>{sp.name}</span>
                                                {sp.maritalStatus && sp.employmentStatus && (
                                                    <span className="text-green-600 text-[10px] uppercase font-bold tracking-wider ml-1 bg-green-100 px-1 rounded">Saved</span>
                                                )}
                                                <button type="button" onClick={() => removeSpouse(idx)} className="text-cyan-400 hover:text-red-500 ml-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Spouse Details Editor */}
                                {spousesList.length > 0 && (
                                    <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 mt-4 space-y-4 backdrop-blur-sm">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Select Spouse to Edit Details</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full px-4 py-2.5 rounded-xl border bg-slate-900/50 border-slate-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all duration-200 appearance-none"
                                                    value={selectedSpouseName}
                                                    onChange={(e) => setSelectedSpouseName(e.target.value)}
                                                >
                                                    <option value="" className="bg-slate-800 text-slate-400">-- Select Spouse --</option>
                                                    {spousesList.map(s => (
                                                        <option key={s.name} value={s.name} className="bg-slate-800 text-white">{s.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedSpouseName && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="space-y-4 pt-4 border-t border-slate-700"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-slate-300">Details for <span className="text-cyan-400 underline decoration-cyan-500/50">{selectedSpouseName}</span></h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Spouse Marital Status - Radio Style */}
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-sm font-semibold text-slate-400 ml-1">Spouse Marital Status</label>
                                                        <div className="flex gap-4">
                                                            {["Single", "Married"].map((status) => (
                                                                <label
                                                                    key={status}
                                                                    className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all duration-200 ${editSpouseMarital === status
                                                                        ? "bg-slate-700 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                                                        : "bg-slate-800 border-slate-600 hover:border-cyan-400/50 hover:bg-slate-700/50"
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="spouse_marital_edit"
                                                                        value={status}
                                                                        checked={editSpouseMarital === status}
                                                                        onChange={() => setEditSpouseMarital(status as any)}
                                                                        className="w-4 h-4 text-cyan-400 accent-cyan-400 bg-slate-900 border-slate-600 focus:ring-cyan-400/20"
                                                                    />
                                                                    <span className={`text-sm font-medium ${editSpouseMarital === status ? "text-cyan-400" : "text-slate-300"}`}>{status}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Spouse Employment Status - Radio Style */}
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-sm font-semibold text-slate-400 ml-1">Spouse Employment Status</label>
                                                        <div className="flex gap-4">
                                                            {["Employed", "Unemployed"].map((status) => (
                                                                <label
                                                                    key={status}
                                                                    className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all duration-200 ${editSpouseEmployment === status
                                                                        ? "bg-slate-700 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                                                        : "bg-slate-800 border-slate-600 hover:border-cyan-400/50 hover:bg-slate-700/50"
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="spouse_employment_edit"
                                                                        value={status}
                                                                        checked={editSpouseEmployment === status}
                                                                        onChange={() => setEditSpouseEmployment(status as any)}
                                                                        className="w-4 h-4 text-cyan-400 accent-cyan-400 bg-slate-900 border-slate-600 focus:ring-cyan-400/20"
                                                                    />
                                                                    <span className={`text-sm font-medium ${editSpouseEmployment === status ? "text-cyan-400" : "text-slate-300"}`}>{status}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={saveSpouseDetails}
                                                    className="w-full py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 font-bold tracking-wide shadow-lg shadow-cyan-500/20"
                                                >
                                                    Save Details for {selectedSpouseName}
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Children Management */}

                        </>
                    ) : (
                        /* Sibling Management (Default/Unmarried) */
                        <div className="md:col-span-2 space-y-4 pt-2 border-t border-gray-100">
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
