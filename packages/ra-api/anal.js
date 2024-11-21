const fs = require('fs');
const path = require('path');

function analyzeTypeScriptTrace(tracePath) {
    // Read the trace directory
    const files = {
        types: JSON.parse(fs.readFileSync(path.join(tracePath, 'types.json'))),
        program: JSON.parse(fs.readFileSync(path.join(tracePath, 'program.json'))),
        resolvedModules: JSON.parse(fs.readFileSync(path.join(tracePath, 'resolvedModules.json')))
    };
    
    // Analyze type creation
    const typeStats = analyzeTypes(files.types);
    
    // Analyze module resolution
    const moduleStats = analyzeModules(files.resolvedModules);
    
    return {
        typeStats,
        moduleStats,
        recommendations: generateRecommendations(typeStats, moduleStats)
    };
}

function analyzeTypes(types) {
    const stats = {
        totalTypes: types.length,
        recursiveTypes: new Set(),
        largeTypes: [],
        complexUnions: [],
    };
    
    const typeMap = new Map();
    
    // Build type reference graph
    types.forEach(type => {
        if (type.references) {
            const refChain = findTypeReferenceChain(type, types, new Set());
            if (refChain.size > 50) {
                stats.recursiveTypes.add(type.id);
            }
        }
        
        if (type.size && type.size > 1000) {
            stats.largeTypes.push({
                id: type.id,
                size: type.size,
                location: type.location
            });
        }
        
        if (type.kind === 'union' && type.types?.length > 20) {
            stats.complexUnions.push({
                id: type.id,
                typeCount: type.types.length,
                location: type.location
            });
        }
    });
    
    return stats;
}

function analyzeModules(modules) {
    return {
        totalModules: modules.length,
        circularDependencies: findCircularDependencies(modules),
        heavyImporters: findHeavyImporters(modules)
    };
}

function findTypeReferenceChain(type, types, visited) {
    if (visited.has(type.id)) {
        return visited;
    }
    
    visited.add(type.id);
    
    if (type.references) {
        type.references.forEach(refId => {
            const referencedType = types.find(t => t.id === refId);
            if (referencedType) {
                findTypeReferenceChain(referencedType, types, visited);
            }
        });
    }
    
    return visited;
}

function generateRecommendations(typeStats, moduleStats) {
    const recommendations = [];
    
    if (typeStats.recursiveTypes.size > 0) {
        recommendations.push({
            issue: 'Recursive Types',
            description: `Found ${typeStats.recursiveTypes.size} potentially recursive types`,
            solution: 'Consider adding depth limits to recursive types or break them into smaller parts'
        });
    }
    
    if (typeStats.largeTypes.length > 0) {
        recommendations.push({
            issue: 'Large Types',
            description: `Found ${typeStats.largeTypes.length} very large types`,
            solution: 'Break down large type definitions into smaller, more manageable pieces'
        });
    }
    
    if (moduleStats.circularDependencies.length > 0) {
        recommendations.push({
            issue: 'Circular Dependencies',
            description: `Found ${moduleStats.circularDependencies.length} circular dependencies`,
            solution: 'Refactor modules to break circular dependencies'
        });
    }
    
    return recommendations;
}

analyzeTypeScriptTrace("./trace")
