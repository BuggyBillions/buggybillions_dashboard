import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface CreateCourseFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required("Course title is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const inputClass = (touched: any, error: any) =>
    `h-11.25 indent-2 border rounded-lg outline-0 disabled:bg-gray-100 ${
      touched && error ? "border-red-500" : "border-black/15"
    }`;

  const errorText = (touched: any, error: any) =>
    touched && error ? (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    ) : null;

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-tetiary">
          {readOnly
            ? "Course Details"
            : initialData
            ? "Edit Course"
            : "Add New Course"}
        </h2>
        <p className="text-sm text-gray-500">
          Provide the course information and description.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Course Title</label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            className={inputClass(formik.touched.title, formik.errors.title)}
            placeholder="Enter course title"
          />
          {errorText(formik.touched.title, formik.errors.title)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={readOnly || isLoading}
          rows={5}
          className={`indent-2 pt-2 border rounded-lg outline-0 disabled:bg-gray-100 resize-none ${
            formik.touched.description && formik.errors.description
              ? "border-red-500"
              : "border-black/15"
          }`}
          placeholder="Enter course description"
        />
        {errorText(formik.touched.description, formik.errors.description)}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          {readOnly ? "Close" : "Cancel"}
        </button>
        {!readOnly && (
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple rounded-md disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : initialData ? (
              "Update Course"
            ) : (
              "Create Course"
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateCourseForm;
