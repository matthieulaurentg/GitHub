/* global THREE */

function createBranch(scene, startPoint, endPoint, thickness, branchLevel = 0) {
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    const length = direction.length();
    
    // Create branch geometry
    const branchGeometry = new THREE.CylinderGeometry(
        thickness * 0.7, // top radius slightly smaller
        thickness, // bottom radius
        length,
        8, // segments
        1, // height segments
        true // open-ended
    );
    
    // Create bark material with detailed texture
    const branchMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3219,
        roughness: 0.9,
        metalness: 0.1,
        wireframe: false,
        flatShading: true
    });
    
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branch.castShadow = true;
    branch.receiveShadow = true;

    // Position and rotate branch
    branch.position.copy(startPoint);
    branch.position.addScaledVector(direction, 0.5);
    
    // Calculate rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );
    branch.setRotationFromQuaternion(quaternion);
    
    scene.add(branch);
    return branch;
}

function createLeafCluster(scene, position, size, color) {
    const leaves = new THREE.Group();
    
    // Create multiple leaf shapes in a cluster
    for (let i = 0; i < 5; i++) {
        const leafGeometry = new THREE.SphereGeometry(size * 0.7, 8, 8);
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        
        // Position leaves in a natural cluster pattern
        const angle = (i / 5) * Math.PI * 2;
        const radius = size * 0.5;
        leaf.position.set(
            position.x + Math.cos(angle) * radius,
            position.y + Math.random() * size * 0.3,
            position.z + Math.sin(angle) * radius
        );
        
        // Random rotation for natural look
        leaf.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        leaves.add(leaf);
    }
    
    scene.add(leaves);
    return leaves;
}

export function createMagicalTree(scene, position) {
    const treeGroup = new THREE.Group();
    
    // Create main trunk
    const trunkHeight = 4;
    const trunkStart = new THREE.Vector3(position.x, 0, position.z);
    const trunkEnd = new THREE.Vector3(position.x, trunkHeight, position.z);
    const trunk = createBranch(scene, trunkStart, trunkEnd, 0.3);
    treeGroup.add(trunk);
    
    // Create main branches
    const numMainBranches = 5;
    const branchLength = 2;
    
    for (let i = 0; i < numMainBranches; i++) {
        const angle = (i / numMainBranches) * Math.PI * 2;
        const heightOffset = (i % 2) * 0.5 + trunkHeight * 0.7;
        
        const branchStart = new THREE.Vector3(
            position.x,
            heightOffset,
            position.z
        );
        
        const branchEnd = new THREE.Vector3(
            position.x + Math.cos(angle) * branchLength,
            heightOffset + 0.5,
            position.z + Math.sin(angle) * branchLength
        );
        
        const branch = createBranch(scene, branchStart, branchEnd, 0.15);
        treeGroup.add(branch);
        
        // Create sub-branches
        const numSubBranches = 3;
        for (let j = 0; j < numSubBranches; j++) {
            const subAngle = angle + (Math.random() - 0.5) * Math.PI / 4;
            const subLength = branchLength * 0.6;
            
            const subStart = branchEnd;
            const subEnd = new THREE.Vector3(
                subStart.x + Math.cos(subAngle) * subLength,
                subStart.y + 0.3,
                subStart.z + Math.sin(subAngle) * subLength
            );
            
            const subBranch = createBranch(scene, subStart, subEnd, 0.08);
            treeGroup.add(subBranch);
            
            // Add leaf clusters at the end of sub-branches
            const leafColors = [
                0x2d5a27, // Dark green
                0x3a7d34, // Forest green
                0x4ca644  // Bright green
            ];
            
            createLeafCluster(
                scene,
                subEnd,
                0.4,
                leafColors[Math.floor(Math.random() * leafColors.length)]
            );
        }
    }
    
    // Add some leaf clusters along the main branches
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * branchLength * 0.8 + 0.5;
        const height = Math.random() * trunkHeight * 0.6 + trunkHeight * 0.5;
        
        const leafPosition = new THREE.Vector3(
            position.x + Math.cos(angle) * radius,
            height,
            position.z + Math.sin(angle) * radius
        );
        
        createLeafCluster(
            scene,
            leafPosition,
            0.3 + Math.random() * 0.2,
            0x2d5a27
        );
    }
    
    // Add some fallen leaves around the base
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2 + 1.5;
        
        const leafPosition = new THREE.Vector3(
            position.x + Math.cos(angle) * radius,
            0.05,
            position.z + Math.sin(angle) * radius
        );
        
        createLeafCluster(
            scene,
            leafPosition,
            0.15,
            0x2d5a27
        );
    }
    
    scene.add(treeGroup);
    return treeGroup;
} 