import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

export interface Blueprint {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  setup: (target: string) => Promise<void>;
}

export async function composeBlueprints(
  target: string,
  blueprints: Blueprint[]
) {
  // Ensure output directory exists
  await fs.ensureDir(target);

  // Run setup for each blueprint (copies files)
  for (const bp of blueprints) {
    await bp.setup(target);
  }

  // Merge package.json from all blueprints
  const pkgPath = path.join(target, "package.json");
  let pkg: any = { name: path.basename(target), version: "0.0.0" };

  // Try to read existing package.json if it exists
  if (await fs.pathExists(pkgPath)) {
    pkg = await fs.readJSON(pkgPath);
  }

  // Merge dependencies
  pkg.dependencies = pkg.dependencies || {};
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.scripts = pkg.scripts || {};

  for (const bp of blueprints) {
    if (bp.dependencies) {
      Object.assign(pkg.dependencies, bp.dependencies);
    }
    if (bp.devDependencies) {
      Object.assign(pkg.devDependencies, bp.devDependencies);
    }
    if (bp.scripts) {
      Object.assign(pkg.scripts, bp.scripts);
    }
  }

  // Ensure type: module for ESM
  pkg.type = "module";

  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  // Install npm dependencies if package.json has dependencies
  const hasDependencies =
    (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) ||
    (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0);

  if (hasDependencies) {
    console.log(`Installing npm dependencies in ${target}...`);
    await execa("pnpm", ["install"], { cwd: target, stdio: "inherit" });
  }

  // Check for Python backend and add setup instructions
  const backendPath = path.join(target, "backend");
  if (await fs.pathExists(backendPath)) {
    const requirementsPath = path.join(backendPath, "requirements.txt");
    if (await fs.pathExists(requirementsPath)) {
      console.log(`\nPython backend detected. To set up:`);
      console.log(`  cd ${path.relative(process.cwd(), backendPath)}`);
      console.log(`  python -m venv venv`);
      console.log(
        `  source venv/bin/activate  # On Windows: venv\\Scripts\\activate`
      );
      console.log(`  pip install -r requirements.txt`);
    }
  }
}
