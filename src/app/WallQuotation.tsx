"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BLOCK_TYPES } from "./blocks";
import { BlockTypeModal } from "./components/BlockTypeModal";

interface BlockType {
  id: number;
  name: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

interface Wall {
  id: number;
  name: string;
  perimeter: number;
  height: number;
  blockType: string;
}

const WallQuotation = () => {
  const [walls, setWalls] = useState<Wall[]>([]);
  const [blockTypes, setBlockTypes] =
    useState<BlockType[]>(DEFAULT_BLOCK_TYPES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedWalls = localStorage.getItem("walls");
    const savedBlockTypes = localStorage.getItem("blockTypes");

    if (savedWalls) {
      setWalls(JSON.parse(savedWalls));
    }
    if (savedBlockTypes) {
      setBlockTypes(JSON.parse(savedBlockTypes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("walls", JSON.stringify(walls));
    localStorage.setItem("blockTypes", JSON.stringify(blockTypes));
  }, [walls, blockTypes]);

  const addWall = () => {
    setWalls([
      ...walls,
      {
        id: Date.now(),
        name: `Parede ${walls.length + 1}`,
        perimeter: 0,
        height: 0,
        blockType: blockTypes[0].name,
      },
    ]);
  };

  const removeWall = (id: number) => {
    setWalls(walls.filter((wall) => wall.id !== id));
  };

  const updateWall = (
    id: number,
    field: keyof Wall,
    value: string | number
  ) => {
    setWalls(
      walls.map((wall) => (wall.id === id ? { ...wall, [field]: value } : wall))
    );
  };

  const calculateBlocks = (wall: Wall): number => {
    const area = wall.perimeter * wall.height;
    const blockType = blockTypes.find((b) => b.name === wall.blockType);
    if (!blockType || !area) return 0;

    const blockArea = blockType.dimensions.width * blockType.dimensions.length;
    return Math.ceil(area / blockArea);
  };

  const getTotalBlocksByType = (): Record<string, number> => {
    return blockTypes.reduce((acc, type) => {
      const total = walls
        .filter((wall) => wall.blockType === type.name)
        .reduce((sum, wall) => sum + calculateBlocks(wall), 0);
      return { ...acc, [type.name]: total };
    }, {} as Record<string, number>);
  };

  const handleAddBlockType = (newBlockType: Omit<BlockType, "id">) => {
    const newId = Math.max(...blockTypes.map((b) => b.id), 0) + 1;
    setBlockTypes([...blockTypes, { ...newBlockType, id: newId }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Tabela de Quantitativos de Blocos
            </h1>
            <button
              onClick={addWall}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
            >
              <p>+</p>
              Adicionar Parede
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gray-50 text-gray-800">
                  <th className="px-4 py-2 text-left">Ref.</th>
                  <th className="px-4 py-2 text-left">Tipo do Bloco</th>
                  <th className="px-4 py-2 text-left">Perímetro (m)</th>
                  <th className="px-4 py-2 text-left">Altura (m)</th>
                  <th className="px-4 py-2 text-left">Área (m²)</th>
                  <th className="px-4 py-2 text-left">Qtd. Blocos</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {walls.map((wall) => (
                  <tr key={wall.id} className="border-b">
                    <td className="px-4 py-2">{wall.name}</td>
                    <td className="px-4 py-2">
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={wall.blockType}
                        onChange={(e) =>
                          updateWall(wall.id, "blockType", e.target.value)
                        }
                      >
                        {blockTypes.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                        value={wall.perimeter}
                        onChange={(e) =>
                          updateWall(
                            wall.id,
                            "perimeter",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                        value={wall.height}
                        onChange={(e) =>
                          updateWall(
                            wall.id,
                            "height",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      {(wall.perimeter * wall.height).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{calculateBlocks(wall)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeWall(wall.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <p>Excluir</p>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Totais por Tipo de Bloco
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Cadastrar Novo Bloco
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(getTotalBlocksByType()).map(([type, total]) => (
                <div key={type} className="bg-white p-4 rounded shadow">
                  <div className="font-medium text-gray-600">{type}</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BlockTypeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddBlockType}
          />
        </div>
      </div>
    </div>
  );
};

export default WallQuotation;
