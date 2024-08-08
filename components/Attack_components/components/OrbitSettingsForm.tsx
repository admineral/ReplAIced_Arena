import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AiOutlineEyeInvisible } from 'react-icons/ai';
import orbitsData from '../../../data/orbits.json';

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  systemMessage: z.string().min(1, { message: "System message is required." }),
  temperature: z.number().min(0).max(1, { message: "Temperature must be between 0 and 1." }),
  secret: z.string().min(1, { message: "Secret is required." }),
  secretWrapper: z.string().min(1, { message: "Secret wrapper is required." }),
});

interface Orbit {
  name: string;
  systemMessage: string;
  temperature: number;
  secret: string;
  secretWrapper: string;
}

const orbits: { [key: string]: Orbit } = orbitsData;

interface OrbitSettingsFormProps {
  id: string;
  onCancel: () => void;
}

export function OrbitSettingsForm({ id, onCancel }: OrbitSettingsFormProps) {
  const orbit = orbits[id];
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: orbit.name,
      systemMessage: orbit.systemMessage,
      temperature: orbit.temperature,
      secret: orbit.secret,
      secretWrapper: orbit.secretWrapper,
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    orbits[id] = { ...orbits[id], ...data };
    console.log("Updated orbit data:", orbits[id]);
    alert('Settings updated successfully!');
    onCancel();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 border border-gray-700 rounded-lg shadow-lg bg-gray-900 text-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-400">Orbit Settings</h2>
        <button onClick={onCancel} type="button" className="text-gray-400 hover:text-gray-200 transition-colors">
          <AiOutlineEyeInvisible className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              {...form.register("name")}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
            />
            {form.formState.errors.name && (
              <p className="mt-2 text-sm text-red-400">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">System Message</label>
            <textarea
              {...form.register("systemMessage")}
              rows={3}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
            />
            {form.formState.errors.systemMessage && (
              <p className="mt-2 text-sm text-red-400">{form.formState.errors.systemMessage.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Temperature</label>
            <input
              type="number"
              step="0.01"
              {...form.register("temperature", { valueAsNumber: true })}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
            />
            {form.formState.errors.temperature && (
              <p className="mt-2 text-sm text-red-400">{form.formState.errors.temperature.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Secret</label>
            <input
              {...form.register("secret")}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
            />
            {form.formState.errors.secret && (
              <p className="mt-2 text-sm text-red-400">{form.formState.errors.secret.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Secret Wrapper</label>
            <input
              {...form.register("secretWrapper")}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
            />
            {form.formState.errors.secretWrapper && (
              <p className="mt-2 text-sm text-red-400">{form.formState.errors.secretWrapper.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}