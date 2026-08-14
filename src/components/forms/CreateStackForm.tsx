import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface CreateStackFormProps {
  initialData?: any;
  courses?: { id: string; title: string }[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

const CreateStackForm: React.FC<CreateStackFormProps> = ({
  initialData,
  courses = [],
  onSubmit,
  onCancel,
  readOnly = false,
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: {
      title: initialData?.title || "",
      courses: initialData?.courses
        ? initialData.courses.map((c: any) =>
            typeof c === "object" ? String(c.id) : String(c)
          )
        : initialData?.course_id
        ? [String(initialData.course_id)]
        : ([] as string[]),
      description: initialData?.description || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required("Stack title is required"),
      courses: Yup.array()
        .of(Yup.string())
        .min(1, "Select a course")
        .required("Course is required"),
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
            ? "Stack Details"
            : initialData
            ? "Edit Stack"
            : "Add New Stack"}
        </h2>
        <p className="text-sm text-gray-500">
          Create a stack with a related course and description.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Stack Title</label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            className={inputClass(formik.touched.title, formik.errors.title)}
            placeholder="Enter stack title"
          />
          {errorText(formik.touched.title, formik.errors.title)}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Course</label>
          {courses.length > 0 ? (
            <select
              name="courses"
              value={formik.values.courses.length > 0 ? formik.values.courses[0] : ""}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue("courses", value ? [value] : []);
              }}
              onBlur={formik.handleBlur}
              disabled={readOnly || isLoading}
              className={inputClass(formik.touched.courses, formik.errors.courses)}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="courses"
              value={formik.values.courses.join(", ")}
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);
                formik.setFieldValue("courses", values);
              }}
              onBlur={formik.handleBlur}
              disabled={readOnly || isLoading}
              className={inputClass(formik.touched.courses, formik.errors.courses)}
              placeholder="Enter course ID"
            />
          )}
          {errorText(formik.touched.courses, formik.errors.courses)}
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
          placeholder="Enter stack description"
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
              "Update Stack"
            ) : (
              "Create Stack"
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateStackForm;
