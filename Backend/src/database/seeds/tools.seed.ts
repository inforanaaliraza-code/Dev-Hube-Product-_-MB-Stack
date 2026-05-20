import { Repository } from 'typeorm';
import { TOOLS_SEED } from '../../tools/data/tools.seed';
import { ToolEntity } from '../../tools/entities/tool.entity';

export async function seedTools(toolsRepo: Repository<ToolEntity>) {
  const count = await toolsRepo.count();
  if (count > 0) {
    return;
  }
  const rows = TOOLS_SEED.map((item) => toolsRepo.create(item));
  await toolsRepo.save(rows);
}
