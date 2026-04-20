"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProjectOption = {
  id: number;
  name: string;
};

export default function ProjectFilter({
  projects,
  selectedProjectId,
}: {
  projects: ProjectOption[];
  selectedProjectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params.set("project_id", value);
    } else {
      params.delete("project_id");
    }
    const query = params.toString();
    router.push(`/predictions${query ? `?${query}` : ""}`);
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
        Proyecto
      </label>
      <select
        name="project_id"
        value={selectedProjectId}
        onChange={(event) => handleChange(event.target.value)}
        className="block w-full min-w-[200px] px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Todos los proyectos</option>
        {projects.map((project) => (
          <option key={project.id} value={String(project.id)}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
